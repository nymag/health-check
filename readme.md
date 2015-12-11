Health Check
=======

Include in all Node projects

## Usage

```js
var express = require('express'),
  healthCheck = require('@nymdev/health-check');

express.use(healthCheck());
```

## Install

```bash
npm install --save @nymdev/health-check