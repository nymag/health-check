Health Check
=======

Health-check middleware for Express.

Returns either HTTP 200 or 500.

Features
- Fetches fields asynchronously (in parallel)
- Supports Promises
- Reports errors individually
- Custom and optional (non-failing) fields

## Usage

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck());
```

exposes `/health-check` with the following information:

```json
{
  "nodeVersionExpected": "4.0.0",
  "nodeVersionActual": "4.2.1",
  "memoryUsage": {
    "rss": 66609152,
    "heapTotal": 58772224,
    "heapUsed": 28870104
  },
  "uptime": 14.538,
  "totalMem": 17179869184,
  "freeMem": 1396756480,
  "loadAvg": [
    1.736328125,
    1.65234375,
    1.76123046875
  ],
  "heap": {
    "total_heap_size": 58772224,
    "total_heap_size_executable": 7340032,
    "total_physical_size": 58772224,
    "total_available_size": 1483938640,
    "used_heap_size": 28890440,
    "heap_size_limit": 1535115264
  },
  "host": "<some hostname>"
}
```

### Environment variables

Environment variables can be reported if they're useful.

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

Can add custom fields to be reported.  Thrown errors in custom fields will return a 500.

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck({
  stats: {
    searchExists: function () {
      var searchService = require('./search');

      return searchService && searchService.ping();
    }
  }
}));
```

### Required fields

Missing fields will return a 500.

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
```

## Install

```bash
npm install --save @nymdev/health-check
```
