Health Check
=======

Include in all Node projects

## Usage

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck());
```

### Environment variables

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  env: [
    'REDIS_HOST',
    'ELASTIC_HOST'
  ]
}));
```

### Custom fields
```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  stats: {
    searchExists: function () {
      var search = require('./search'),
        client = search && search.getInstance();

      return client.ping();
    }
  }
}));

### Required fields

Requires host, someName and REDIS_HOST to exist, or it returns 500.

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  required: [
    'host',
    'someName',
    'REDIS_HOST'
  ],
  stats: {
    someName: someFunction
  },
  env: [
    'REDIS_HOST'
  ]
}));

## Install

```bash
npm install --save @nymdev/health-check