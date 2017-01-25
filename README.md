# win-query-utils

[![Build Status](https://travis-ci.org/strawhatboy/node-win-query-utils.svg?branch=master)](https://travis-ci.org/strawhatboy/node-win-query-utils)

use windows `query.exe` to do the query and return the results

## Usage
queryUser | querySession | queryProcess (options, callback)

**options**
- **timeout** : default: 5000, if the `query` command hang there for some reason, set this value to force return error and kill the process.
- **serverName** : corresponding to the `/SERVERNAME` option of `query.exe`

> *Note*: options can be omitted to use the default values

## Example
```js
var winQueryUtils = require('win-query-utils');
var _ = require('lodash');

winQuerUtils.querySession(function(err, data) {
    if (!err) {
        console.log('Active session id of user TestUser is: ' + 
            _.find(data, { state: 'Active', username: 'TestUser' }).sessionId);
    }
};
```

## APIs

- **queryUser** returns the results of command `query user`
```js
[
    {
        username: 'string',
        sessionName: 'string',
        sessionId: 'string',
        state: 'string',
        idleTime: 'string',
        logonTime: 'string'
    }
]
```

- **querySession** returns the results of command `query session`
```js
[
    {
        sessionName: 'string',
        username: 'string',
        sessionId: 'string',
        state: 'string',
        type: 'string',
        device: 'string'
    }
]
```

- **queryProcess** returns the results of command `query process`
```js
[
    {
        username: 'string',
        sessionName: 'string',
        sessionId: 'string',
        processId: 'string',
        processName: 'string'
    }
]