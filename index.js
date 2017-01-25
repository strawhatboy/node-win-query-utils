/*
 * win-query-utils
 * 
 * use query.exe in windows to query information about user, session, process
 * 
 * author: Andy Cui
 * init date: Jan 25, 2017
 * 
 */
var spawn = require('child_process').spawn;

exports = module.exports = (function () {
    var COL_NAME = {
        USERNAME: 'username',
        SESSIONNAME: 'sessionName',
        ID: 'sessionId',
        STATE: 'state',
        IDLE_TIME: 'idleTime',
        LOGON_TIME: 'logonTime',
        PID: 'processId',
        IMAGE: 'processName',
        TYPE: 'type',
        DEVICE: 'device'
    };

    var COL_LENGTH = {
        user: {
            USERNAME: [1, 23],
            SESSIONNAME: [23, 42],
            ID: [42, 46],
            STATE: [46, 54],
            IDLE_TIME: [54, 65],
            LOGON_TIME: [65]
        },
        session: {
            SESSIONNAME: [1, 19],
            USERNAME: [19, 44],
            ID: [44, 48],
            STATE: [48, 56],
            TYPE: [56, 68],
            DEVICE: [68]
        },
        process: {
            USERNAME: [1, 23],
            SESSIONNAME: [23, 43],
            ID: [43, 45],
            PID: [45, 52],
            IMAGE: [54]
        }
    };

    var DEFAULT_OPTIONS = {
        serverName: '',
        timeout: 5000
    }

    var launchProcessAndGetOutput = function (command, args, timeout, callback) {
        var endFunction = false;

        var process = spawn(command, args);
        var stdout = '';
        var stderr = '';
        process.on('exit', function (code, signal) {
            // process exit
            if (!endFunction) {
                endFunction = true;
                callback ? callback(undefined, { stdout: stdout, stderr: stderr, code: code, signal: signal }) : '';
            }
        });

        var timer = setTimeout(function () {
            if (!endFunction) {
                endFunction = true;
                process.kill();
                callback('operation time out');
            }
        }, timeout);

        process.stdout.on('data', function (data) { stdout += data });
        process.stderr.on('data', function (data) { stderr += data });

        return process;
    }

    var processData = function (type, data) {
        var columns = COL_LENGTH[type];
        var lines = data.split(/[\r\n]/);
        var length = lines.length;
        var array = [];
        for (var i = 1; i < length; i++) {
            var line = lines[i].trimRight();
            if (!line.trim()) {
                continue;
            }
            var obj = {};

            for (var col in columns) {
                if (columns.hasOwnProperty(col)) {
                    var column = columns[col];
                    obj[COL_NAME[col]] = line.substring(column[0], column.length >= 2 ? column[1] : undefined).trim();
                }
            }
            array.push(obj);
        }

        return array;
    }

    var processUserData = function (data) {
        return processData('user', data);
    }

    var processSessionData = function (data) {
        return processData('session', data);
    }

    var processProcessData = function (data) {
        return processData('process', data);
    }

    var getOptions = function (options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = DEFAULT_OPTIONS;
        }
        var additionalParams = [];
        if (options.serverName) {
            additionalParams.push('/SERVERNAME:' + options.serverName);
        }
        return { options: options, callback: callback, additionalParams: additionalParams };
    }

    var queryUser = function (options, callback) {
        var parameters = getOptions(options, callback);
        launchProcessAndGetOutput(
            'query',
            ['user'].concat(parameters.additionalParams),
            parameters.options.timeout,
            function (err, data) {
                if (err) {
                    // got error
                    parameters.callback ? parameters.callback('timeout') : '';
                } else {
                    parameters.callback ? parameters.callback(undefined, processUserData(data.stdout)) : '';
                }
            });
    }

    var queryProcess = function (options, callback) {
        var parameters = getOptions(options, callback);
        launchProcessAndGetOutput(
            'query',
            ['process', '*'].concat(parameters.additionalParams),
            parameters.options.timeout,
            function (err, data) {
                if (err) {
                    // got error
                    parameters.callback ? parameters.callback('timeout') : '';
                } else {
                    parameters.callback ? parameters.callback(undefined, processProcessData(data.stdout)) : '';
                }
            });
    }

    var querySession = function (options, callback) {
        var parameters = getOptions(options, callback);
        launchProcessAndGetOutput(
            'query',
            ['session'].concat(parameters.additionalParams),
            parameters.options.timeout,
            function (err, data) {
                if (err) {
                    // got error
                    parameters.callback ? parameters.callback('timeout') : '';
                } else {
                    parameters.callback ? parameters.callback(undefined, processSessionData(data.stdout)) : '';
                }
            });
    }

    return {
        queryUser: queryUser,
        querySession: querySession,
        queryProcess: queryProcess
    };
})();