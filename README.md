# gulp-brass-npm

[![Build Status](http://img.shields.io/travis/monai/gulp-brass-npm/develop.svg)](https://travis-ci.org/monai/gulp-brass-npm)
[![NPM Version](http://img.shields.io/npm/v/gulp-brass-npm.svg)](https://www.npmjs.org/package/gulp-brass-npm)

Helpers for packaging npm packages with gulp-brass.

## How to use

Check out self explanatory [example](https://github.com/monai/gulp-brass/blob/develop/examples/theapp/gulpfile-npm.js).

## API

```js
var npm = require('gulp-brass-npm');
```
### Tasks

#### npm.sourceTask(pkg, rpm)

Runs `npm pack` and extracts package archive to `rpm.buildDir_BUILD`.

#### npm.binariesTask(pkg, rpm)

Symlinks `pkg.bin`.

#### npm.serviceTask(rpm)

Creates service file from default template.

### Functions

#### npm.getOptions(pkg)

Extracts default options from `package.json`.

## License

ISC
