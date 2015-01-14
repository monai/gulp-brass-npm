var ld = require('lodash');
var dz = require('dezalgo');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');

module.exports = {
    getOptions: getOptions,
    sourceTask: sourceTask
};

function getOptions(pkg) {
    var out;
    
    out = {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        license: pkg.license
    };
    
    if (pkg.author) {
        out.vendor = pkg.author;
    }
    
    // if (pkg.bin) {
    //     out.bin = pkg.bin;
    // }
    
    // if (pkg.brass) {
    //     ld.merge(out, pkg.brass);
    // }
    
    defaults = {
        summary: 'Node.js package '+ pkg.name,
        release: 1,
        group: 'Applications/Internet',
    };
    
    ld.merge(out, defaults);
    
    return out;
}

function sourceTask(pkg, rpm) {
    return function $sourceTask(callback) {
        async.series([
            function (callback) {
                exec('npm pack', callback);
            }, function (callback) {
                var archive;
                
                archive = pkg.name +'-'+ pkg.version +'.tgz';
                archive = path.resolve(rpm.buildDir_BUILD, path.join(process.cwd(), archive));
                
                exec('tar xvzf '+ archive +' --strip-components=1 -C '+ rpm.buildDir_BUILD, callback);
            }, function (callback) {
                exec('npm install', {
                    env: { NODE_ENV: 'production' },
                    cwd: rpm.buildDir_BUILD
                }, callback);
            }
        ], dz(callback));
    }
}
