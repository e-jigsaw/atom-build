require! {
  fs
  lson: {parseFile}
}

module.exports.niceName = 'Custom file (.atom-build.json)'

module.exports.isEligable = (path)-> fs.existsSync "#{path}/.atom-build.lson"

module.exports.settings = (path)->
  realAtomBuild = fs.realpathSync "#{path}/.atom-build.lson"
  delete require.cache[realAtomBuild]

  build = parseFile realAtomBuild
  return
    exec: build.cmd
    env: build.env
    args: build.args
    cwd: build.cwd
    sh: build.sh
    errorMatch: build.errorMatch
