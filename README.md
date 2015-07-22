# pub-pkg-editor

Simple textarea-based editor for pub-server with live preview using jQuery.

### installation

pub-pkg-editor is included with `pub-server` and enabled by default when the server is used from the command line.

To run `pub-server` _without_ the editor, use `pub -E` or set `opts.editor = false`, the default when running programmatically.

### how it works

This editor is packaged as a pub-pkg (see `pub-config.js`)

- pages can be edited by prefixing their url path with `/pub`
- a server-plugin handles the `/pub` route
- when this route is requested the first time, `pub-generator` and a complete set of sources are loaded by the browser
- the window is split into an editor section on the left and a preview on the right
- the entire site can be navigated without any round trips to the server
- output is rendered into an iframe so that website html is reproduced exactly
- while navigating in the preview, the page or fragment markdown source is made editable via the textarea on the left
- fragments require additional fragment-selection ui overlaid in preview when necessary
- see [pub-preview](https://github.com/jldec/pub-preview) for more details.
