module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['ffi-napi'],
      builderOptions: {
        extraResources: [
          {
            from: "./dll/arithmetic-operations_ia32.dll",
            to: "../dll/arithmetic-operations_ia32.dll"
          },
          {
            from: "./dll/arithmetic-operations_x64.dll",
            to: "../dll/arithmetic-operations_x64.dll"
          }
        ]
      }
    }
  }
}
