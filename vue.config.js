module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['ffi-napi'],
      builderOptions: {
        extraResources: [
          {
            from: "./dll/arithmeticoperations.dll",
            to: "../dll/arithmeticoperations.dll"
          }
        ]
      }
    }
  }
}
