// pub-pkg-editor pub-config.js

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
    { path: './static/js',  route: '/pub/js', maxAge:'30d' },
    { path: './node_modules/humane-js/themes/flatty.css', route: '/pub/humane-js' }
  ]
};


