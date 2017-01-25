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

exports = module.exports = (function() {
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

    var launchProcessAndGetOutput = function (command, args, timeout, callback) {
        var endFunction = false;

        var timer = setTimeout(function() {
            if (!endFunction) {
                endFunction = true;
                callback('operation time out');
            }
        }, timeout);

        var process = spawn(command, args);
        var stdout = '';
        var stderr = '';
        process.on('exit', function(code, signal) {
            // process exit
            if (!endFunction) {
                endFunction = true;
                callback ? callback(undefined, { stdout: stdout, stderr: stderr, code: code, signal: signal }) : '';
            }
        });

        process.stdout.on('data', function(data) { stdout += data } );
        process.stderr.on('data', function(data) { stderr += data } );

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


    var queryUser = function (callback) {
        launchProcessAndGetOutput('query', ['user'], 3000, function(err, data) {
            if (err) {
                // got error
            } else {
                callback(undefined, processUserData(data.stdout));
            }
        });
    }

    var queryProcess = function (callback) {
        launchProcessAndGetOutput('query', ['process', '*'], 3000, function(err, data) {
            if (err) {
                // got error
            } else {
                callback(undefined, processProcessData(data.stdout));
            }
        });
    }

    var querySession = function (callback) {
        launchProcessAndGetOutput('query', ['session'], 3000, function(err, data) {
            if (err) {
                // got error
                callback('timeout');
            } else {
                callback(undefined, processSessionData(data.stdout));
            }
        });
    }

    return {
        queryUser: queryUser,
        querySession: querySession,
        queryProcess: queryProcess
    };
})();