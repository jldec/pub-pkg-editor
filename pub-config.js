// pub-pkg-editor pub-config.js
// do NOT inject from this package (that will inject editor css/js into editees)

module.exports =
{ 'pub-pkg':'pub-pkg-editor',

  sources: [
    { path:'./src', route:'/pub', fragmentDelim:true },
  ],

  generatorPlugins: [
  ],

  serverPlugins: [
    './plugins/editor-server.js'
  ],

  browserScripts: [
    { path: './client/editor-ui.js',   route: '/pub/js' },
    { path: './client/pub-preview.js', route: '/pub/js' }
  ],

  staticPaths: [
    { path: './static/css', route: '/pub/css' },
    { path: './node_modules/humane-js/themes/flatty.css', route: '/pub/humane-js' }
  ]
};


