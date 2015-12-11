'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  lib = require('../.'),
  sinon = require('sinon');

describe('lib', function () {
  const fn = lib;

  it('returns default case', function () {
    fn({});
  });
});

describe('renderHealth', function () {
  const fn = lib[this.title];

  it('returns default case', function () {
    const stats = {},
      resultFn = fn(stats),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.send, {});
    });
  });

  it('returns default case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); }
      },
      resultFn = fn(stats),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd' });
    });
  });

  it('does not fail error case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); },
        e: function () { return bluebird.reject(new Error('f')); }
      },
      resultFn = fn(stats),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd', errors: ['f'] });
    });
  });

  it('fails required error case', function () {
    const stats = {
        a: function () { return 'b'; },
        c: function () { return bluebird.resolve('d'); },
        e: _.assign(function () { return bluebird.reject(new Error('f')); }, {isRequired: true})
      },
      resultFn = fn(stats),
      req = {},
      res = {
        status: sinon.stub(),
        send: sinon.spy()
      };

    res.status.returns(res);

    return resultFn(req, res).then(function () {
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.send, {a: 'b', c: 'd', errors: ['f']});
    });
  });
});
