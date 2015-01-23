var ld = require('lodash');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');

module.exports = {
    getOptions: getOptions,
    sourceTask: sourceTask,
    binariesTask: binariesTask,
    serviceTask: serviceTask
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
                var env = ld.assign({}, process.env, { NODE_ENV: 'production' });
                exec('npm install', {
                    env: env,
                    cwd: rpm.buildDir_BUILD
                }, callback);
            }
        ], callback);
    };
}

function binariesTask(pkg, rpm) {
    return function $binariesTask() {
        var gulp, brass, options, bin, targets, names, installDir;
        
        gulp = this;
        brass = rpm.brass;
        options = rpm.options;
        bin = pkg.bin;
        installDir = options.installDir || options.target;
        
        if ( ! bin) {
            return function () {};
        }
        if ( ! ld.isPlainObject(bin)) {
            bin = {};
            bin[pkg.name] = pkg.bin;
        }
        
        targets = ld.values(bin);
        targets = targets.map(function (target) {
            return path.join(rpm.buildRoot, path.join(installDir, target));
        });
        
        names = ld.keys(bin);
        names = names.map(function (name) {
            return path.join(rpm.buildRoot, path.join(options.prefix, 'bin', name));
        });
        
        return gulp.src(targets)
        .pipe(brass.util.symlink(names))
        .pipe(rpm.files());
    };
}

function serviceTask(rpm) {
    return function $serviceTask() {
        var gulp, brass, options;
        
        gulp = this;
        brass = rpm.brass;
        options = rpm.options.service;
        
        options.exec = options.exec || options.target;
        options.target = options.exec;
        
        return gulp.src(brass.util.assets('service/systemd'))
        .pipe(brass.util.template(options))
        .pipe(brass.util.rename(options.name +'.service'))
        .pipe(gulp.dest(path.join(rpm.buildRoot, '/lib/systemd/system')))
        .pipe(rpm.files());
    };
}
