var os = require('os');
var mySpawn = require('mock-spawn')();
var fs = require('fs');
var path = require('path');

var oldSpawn = require('child_process').spawn;
require('child_process').spawn = mySpawn;
mySpawn.setStrategy(function (command, args, opts) {
    if (command !== 'query') { return null; } // use default 
    return function (cb) {
        switch (args[0]) {
            case 'user':
                this.stdout.write(fs.readFileSync(path.resolve(__dirname, './resources/query_user.txt'), 'utf-8'));
                break;
            case 'session':
                this.stdout.write(fs.readFileSync(path.resolve(__dirname, './resources/query_session.txt'), 'utf-8'));
                break;
            case 'process':
                this.stdout.write(fs.readFileSync(path.resolve(__dirname, './resources/query_process.txt'), 'utf-8'));
                break;
            default:
                break;
        }
        return cb(0); // and exit 0 
    };
});

var winQueryUtils = require('../index');
var expect = require('chai').expect;

describe('win-query-utils', function() {
    this.timeout(10000);

    it('should parse the query user result correctly', function(done) {
        winQueryUtils.queryUser(function(err, data) {
            expect(err).to.be.undefined;
            expect(data[0].username).to.equal('biubiubi');
            done();
        });
    });

    it('should parse the query session result correctly', function(done) {
        winQueryUtils.querySession(function(err, data) {
            expect(err).to.be.undefined;
            expect(data[1].sessionId).to.equal('2');
            done();
        });
    });

    it('should parse the query process result correctly', function(done) {
        winQueryUtils.queryProcess(function(err, data) {
            expect(err).to.be.undefined;
            expect(data[0].processId).to.equal('4868');
            done();
        });
    });

    it('should fail if the process timeout', function(done) {
        // setup the spawn to return after 1 sec
        mySpawn.setSignals(['SIGTERM']);
        mySpawn.setStrategy(function(command, args, opts) {
            if (command !== 'query') { return null; } // use default 
            return function(cb) {
                if (args[0] === 'user') {
                    this.stdout.write(fs.readFileSync(path.resolve(__dirname, './resources/query_user.txt'), 'utf-8'));
                    setTimeout(function() {
                        cb(0);
                    }, 1000);
                }
            };
        });

        winQueryUtils.queryUser({timeout: 500}, function(err, data) {
            expect(err).to.be.not.undefined;
            done();
        });
    })
});