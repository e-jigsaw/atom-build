'use babel';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var CSON = require('cson-parser');
var lson = require('lson');

module.exports.niceName = 'Custom file';

function getConfig(file) {
  const realFile = fs.realpathSync(file);
  delete require.cache[realFile];
  switch (path.extname(file)) {
    case '.json':
      return require(realFile);
    case '.cson':
      return CSON.parse(fs.readFileSync(realFile));
    case '.lson':
      return lson.parseFile(realFile);
  }
}

function createBuildConfig(build, name) {
  return {
    name: 'Custom: ' + name,
    exec: build.cmd,
    env: build.env,
    args: build.args,
    cwd: build.cwd,
    sh: build.sh,
    errorMatch: build.errorMatch,
    keymap: build.keymap
  };
}

module.exports.isEligable = function (cwd) {
  this.files = _([ '.atom-build.json', '.atom-build.cson', '.atom-build.lson' ])
    .map(file => path.join(cwd, file))
    .filter(fs.existsSync);
  return 0 < this.files.length;
};

module.exports.settings = function () {
  const config = [];
  this.files.map(getConfig).forEach(build => {
    config.push(
      createBuildConfig(build, build.name || 'default'),
      ..._.map(build.targets, (target, name) => createBuildConfig(target, name))
    );
  });

  return config;
};

module.exports.on = function (ev, cb) {
  this.fileWatchers = this.fileWatchers || [];
  if ('refresh' !== ev || !this.files) {
    return;
  }

  this.fileWatchers.push(...this.files.map(file => fs.watch(file, cb)));
};

module.exports.off = function (ev) {
  this.fileWatchers = this.fileWatchers || [];
  if ('refresh' !== ev) {
    return;
  }

  this.fileWatchers.forEach(watcher => watcher.close());
  this.fileWatchers = [];
};
