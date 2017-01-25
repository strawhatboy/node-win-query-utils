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

    before(function() {
        if (!os.type().toLowerCase().includes('windows')) {
            this.skip();
        }
    });

    it('should parse the query user result correctly', function(done) {
        winQueryUtils.queryUser(function(err, data) {
            expect(data[0].username).to.equal('biubiubi');
            done();
        });
    });

    it('should parse the query session result correctly', function(done) {
        winQueryUtils.querySession(function(err, data) {
            expect(data[1].sessionId).to.equal('2');
            done();
        });
    });

    it('should parse the query process result correctly', function(done) {
        winQueryUtils.queryProcess(function(err, data) {
            expect(data[0].processId).to.equal('4868');
            done();
        });
    })
});