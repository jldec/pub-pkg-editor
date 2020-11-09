// pub-pkg-editor pub-config.js
// do NOT inject from this package (that will inject editor css/js into editees)

module.exports =
{ 'pub-pkg':'pub-pkg-editor',

  sources: [
    { path:'./src', writable:true }
  ],

  generatorPlugins: './generator-plugin.js',

  browserScripts: [
    { path: './client/editor-ui.js', route: '/pub/js' },
    { path: require('pub-preview'),  route: '/pub/js' }
  ],

  staticPaths: [
    { path: './static/css', route: '/pub/css' },
    { path: './node_modules/humane-js/themes/flatty.css', route: '/pub/humane-js' }
  ]
};
