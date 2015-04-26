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

### html template guidelines

- when content is modified an attempt is made to determine whether the edit affects the layout, the page or fragment container, or just the  html rendered from markdown

- in order to maximize responsiveness, the editor relies on data attributes on html tags to replace just the affected HTML


- `data-render-layout` = name of the layout template - container element with this attribute must wrap {{{renderLayout}}})
- `data-render-page` = name of the page template - container with this attribute must wrap {{{renderPage}}}
- `data-render-html` = _href of fragment or page - wrapper div auto-inserted by {{{html}}}
