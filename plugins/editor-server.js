/*
 * pub-pkg-editor server plugin
 *
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 */

module.exports = function(server) {

  server.on('init-app-last', function() {
    var opts = server.opts;
    var app = server.app;
    var generator = server.generator;
    var editor = generator.page$['/pub/'];


    // mount /pub last to avoid breaking /pub/... routes and statics
    app.use ('/pub', function(req, res) {
      server.generator.route = req.url;
      res.send(server.generator.renderDoc(editor));
    });

  });

}
