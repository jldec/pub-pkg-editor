# pub-pkg-editor

Simple textarea-based editor for pub-server with live preview using jQuery.

This editor runs in the browser and depends on modern browser [history management](https://caniuse.com/#search=history) support. It can be served either by pub-server, or from a static website.

The `/pub/` window is split into a source editor section on the left and a preview on the right.

Changes made to the source on the left are immediately reflected in the generated HTML on the right.

Changes are also saved to disk immediately when running pub-server locally or when logged-in to a pub-gatekeeper in the cloud.

![screenshot](/images/editor-screen.png)

### installation

pub-pkg-editor is included with `pub-server` and enabled by default when the server is used from the command line.

To run `pub-server` _without_ the editor, use `pub -E` or set `opts.noEditor = true`, the default when running programmatically.

### how it works

This editor is packaged as a pub-pkg (see `pub-config.js`). Any page can be opened in the editor by navigating to:

```
/pub/?page={page-url}
```

The main window contains a simple textarea on the left, and preview pane on the right. An AJAX request loads pub-generator and source for the entire site. The preview pane holds an iframe initially loaded with the site's root page, but replaced immediately, with the content of the page specified in the page parameter.

The preview has 2 modes

1. In fragment selection mode (which is the default), clicking on a text fragment surrounded by dotted lines opens the markdown source for that fragment in the editor. In this mode, links within selectable text fragments cannot be navigated.

2. fragment selection mode is toggled on/off using the finger button at the top right. When toggled off, links within text fragments can be navigated to reach other pages on the site.

See [pub-preview](https://github.com/jldec/pub-preview) for more details.
