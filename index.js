'use strict';

var statList;
const _ = require('lodash'),
  bluebird = require('bluebird'),
  express = require('express'),
  v8 = require('v8'),
  os = require('os'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  healthRoute = process.env.HEALTH_CHECK_PATH;

/**
 * @param {string} filename
 * @returns {string}
 */
function readFile(filename) {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch (ex) {
    return null;
  }
}

/**
 * Get yaml file
 * @param {string} filename
 * @returns {object}
 */
function getYaml(filename) {
  return yaml.safeLoad(readFile(filename + '.yaml') || readFile(filename + '.yml'));
}

statList = {
  nodeVersionExpected: function () { return _.get(getYaml('circle'), 'machine.node.version'); },
  nodeVersionActual: function () { return process.versions.node; },
  memoryUsage: function () { return process.memoryUsage(); },
  uptime: function () { return process.uptime(); },
  totalMem: function () { return os.totalmem(); },
  freeMem: function () { return os.freemem(); },
  loadAvg: function () { return os.loadavg(); },
  heap: function () { return v8.getHeapStatistics(); },
  host: function () { return os.hostname(); }
};


function renderHealth(allStats) {
  return function (req, res) {
    var stats = {},
      errors = [];

    return bluebird.all(_.map(allStats, function (value, key) {
      var promise = bluebird.try(value).then(function (result) { stats[key] = result; });

      if (value.isRequired) {
        return promise;
      } else {
        return promise.catch(function (ex) {
          errors.push(ex.message);
        });
      }
    })).then(function () {
      if (errors.length) {
        stats.errors = errors;
      }
      res.status(200).send(stats);
    }).catch(function (ex) {
      errors.push(ex.message);
      stats.errors = errors;
      res.status(500).send(stats);
    });
  };
}

/**
 *
 * @param {express.Router} router
 * @param {object} [options]
 * @param {object} [options.stats]  Hash of extra stats to include with their functions or objects
 * @param {[string]} [options.env]  Environment Variables to include
 * @param {[string]} [options.required]  Stats that will cause a 500 if missing
 * @returns {*}
 */
function routes(options) {
  options = options || {};
  const router = express.Router(),
    stats = _.assign(options.stats || {}, statList);

  // shortcut to list environment variables
  _.each(options.env, function (value) {
    stats[value] = function () { return process.env[value]; };
  });

  // fail when these functions fail
  _.each(options.required, function (value) {
    if (_.isObject(stats[value]) || _.isFunction(stats[value])) {
      stats[value].isRequired = true;
    } else {
      throw new Error('Required stat ' + value + ' is not defined.');
    }
  });

  if (healthRoute) {
  // e.g. /microservice-name/health-check
  router.get('/' + healthRoute + '/health-check', renderHealth(stats));
  }
  router.get('/health-check', renderHealth(stats));

  return router;
}

module.exports = routes
module.exports.renderHealth = renderHealth;