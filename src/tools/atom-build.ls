require! {
  fs
  lson: {parseFile}
  path: {join}
  lodash: _
}

module.exports.niceName = 'Custom file (.atom-build.json)'

module.exports.isEligable = (cwd)-> fs.existsSync join cwd, \.atom-build.lson

module.exports.settings = (cwd)->
  realAtomBuild = fs.realpathSync "#{cwd}/.atom-build.lson"
  delete require.cache[realAtomBuild]

  createBuildConfig = (build, name)->
    name: "Custom: #{name}"
    exec: build.cmd
    env: build.env
    args: build.args
    cwd: build.cwd
    sh: build.sh
    errorMatch: build.errorMatch

  build = parseFile realAtomBuild
  config = []

  config.push createBuildConfig build, build.name or \default
  _.forEach (build.targets or []), (target, name)->
    config.push createBuildConfig target, name

  config
