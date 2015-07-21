/*
 * editor-ui.js
 * browserify entry point for pub-pkg-editor user interface
 *
 * - depends on jquery
 * - uses iframe containing website layout for preview with 2 editing modes
 * - edit-mode captures clicks purely for selecting areas of content to edit
 * - nav-mode makes the iframe work just like a normal website
 *
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
*/

var humane = require('humane-js').create({timeout:600});

window.onGeneratorLoaded = function editorUI(generator) {

  var opts = generator.opts;

  var log = opts.log;

  var origin = location.href.replace(/^(.*?:\/\/[^\/]+)\/.*$/,'$1' + '/pub')

  var $outer = $('.outer').get(0); // outermost div - for width and height

  var editor =
    { $name:   $('.name'),            // jquery name area in header
      $edit:   $('textarea.editor'),  // jquery editor textarea
      $save:   $('.savebutton'),      // jquery save button

      // binding is the _href of fragment being edited
      // NOTE: don't bind by ref! recompile invalidates refs
      binding: '' };

  var $preview = $('iframe.preview'); // jquery preview iframe
  var iframe = $preview.get(0);       // preview iframe

  var isLeftRight = true;
  var editorSize; // set in resizeEditor

  var DDPANE = 'pane-handle-drag'; // custom drag event type for pane handles

  var $css, pwindow; // set in previewOnLoad

  // iframe navigation and window backbutton handlers - use polling instead of onload
  // iframe.onload = previewOnLoad;
  var previewPoller = setInterval(previewOnLoad, 150);

  // navigation handler - nav events emitted by pager in pub-preview.js
  // note: fragments are selected via fragmentClick in preview selection mode
  generator.on('nav', handleNav);
  generator.on('loaded', handleNav);
  generator.on('notify', function(s) { log(s); humane.log(s); });

  $( window ).on('beforeunload', function() {
    log('beforeunload')
    generator.clientSaveHoldText();
    generator.clientSaveUnThrottled(); // throttled version may do nothing
  });

  $('.editbutton').click(toggleFragments);

  // show save button on the static host
  if (opts.staticHost) {
    $('.savebutton').removeClass('hide').click(generator.clientSave);
  }

  /* disabled menu links
  // either do single action in editor or show iframe e.g for upload

  $('.panebutton').click(togglePanes);
  $('.menubutton').click(toggleForm);
  $('.name').click(revertEdits);
  $('.helpbutton').click(help);

  */

  // initialize drag to adjust panes - use Text for type to satisfy IE
  $('.handle').attr('draggable', 'true').get(0)
    .addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('Text', DDPANE);
    });

  // handle pane adjust event over editor
  document.addEventListener('dragover', function(e) {
    adjustPanes(e.clientX, e.clientY, false); // handle over editor
    e.preventDefault();
  });

  // handle pane adjuster drop event
  // (firefox will try to navigate to the url if text is dropped on it)
  document.addEventListener('drop', function(e) {
      e.preventDefault();
  });

  // restore pane dimensions
  resizeEditor(-1);

  // preview iframe onload handler - initializes pwindow and $css
  function previewOnLoad() {
    pwindow = iframe.contentWindow;
    var p$ = pwindow && pwindow.$;        // preview jquery object
    if (!p$ || p$.editorLoaded) return;   // not ready || already initialized

    var pdoc = pwindow.document;

    // handle pane adjust event over preview
    pdoc.addEventListener('dragover', function(e) {
      adjustPanes(e.clientX, e.clientY, true); // handle over preview
      e.preventDefault();
    });

    // handle pane adjuster drop event over preview
    // (firefox will try to navigate to the url if text is dropped on it)
    pdoc.addEventListener('drop', function(e) {
      e.preventDefault();
    });

    $css = p$('<link rel="stylesheet" href="/pub/css/pub-preview.css">');
    p$('head').append($css);
    $css.get(0).disabled = true;
    toggleFragments();

    var $script = p$('<script src="/pub/js/pub-preview.js"></script>');
    p$('body').append($script);

    p$.editorLoaded = true;
    clearInterval(previewPoller);

    // fixup custom preview after injecting js/css
    var ploc = pwindow.location;
    if (window.location.hash) { ploc.hash = window.location.hash; }
    else {
      generator.emit('update-view', ploc.pathname, ploc.search, ploc.hash);
      if (!editor.binding) { handleNav(ploc.pathname, ploc.search, ploc.hash); }
    }
  };

  function toggleFragments() {
    var css = $css && $css.get(0);
    if (!css) return;
    if (css.disabled) {
      css.disabled = false;
      pwindow.addEventListener('click', fragmentClick, true);
    }
    else {
      css.disabled = true;
      pwindow.removeEventListener('click', fragmentClick, true);
    }
  }

  // fragment click handler
  function fragmentClick(e) {
    var el = e.target;
    var href;
    while (el && el.nodeName !== 'HTML' && !el.getAttribute('data-render-html')) { el = el.parentNode };
    if (el && (href = el.getAttribute('data-render-html'))) {
      bindEditor(generator.fragment$[href]);
    }
//    toggleFragments();  // single fragment select less confusing
    e.preventDefault(); // will also stop pager because it checks for e.defaultPrevented
  }

  // navigation handler
  function handleNav(path, query, hash) {
    if (path) {
      // replace /pub/path... with /path...
      history.replaceState(null, null, origin + path + query + hash);
      bindEditor(generator.fragment$[path + hash]);
    }
    else {
      // reload
      bindEditor(generator.fragment$[editor.binding]);
    }
  }

  // change editingHref to a different fragment or page
  function bindEditor(fragment) {
    saveBreakHold();
    if (fragment) {
      editor.$name.text(fragment._href);
      if (fragment._holdUpdates) {
        editText(fragment._holdText);
      }
      else {
        editText(fragment._hdr + fragment._txt);
      }
      editor.binding = fragment._href;
    }
    else {
      editor.$name.text('');
      editText('');
      editor.binding = '';
    }
  }

  // replace text in editor using clone()
  // firefox gotcha: undo key mutates content after nav-triggered $edit.val()
  // assume that jquery takes care of removing keyup handler
  function editText(text) {
    var $newedit = editor.$edit.clone().val(text);
    editor.$edit.replaceWith($newedit);
    editor.$edit = $newedit;
    editor.$edit.on('keyup', editorUpdate);
  }

  // register updates from editor using editor.binding
  function editorUpdate() {
    if (editor.binding) {
      if ('hold' === generator.clientUpdateFragmentText(editor.binding, editor.$edit.val())) {
        editor.holding = true;
      }
    }
  }

  // save with breakHold - may result in modified href ==> loss of binding context?
  function saveBreakHold() {
    if (editor.binding && editor.holding) {
      generator.clientUpdateFragmentText(editor.binding, editor.$edit.val(), true);
      editor.holding = false;
    }
  }

  // toggle panes between left/right and top/bottom
  function togglePanes() {
    $('.editorpane').toggleClass('row col left top');
    $('.previewpane').toggleClass('row col right bottom');
    isLeftRight = $('.handle').toggleClass('leftright topbottom').hasClass('leftright');
    resizeEditor(-1);
  }

  function toggleForm() {
    $('.form').toggle();
    $('.editor').toggleClass('showform');
  }

  // draggable pane adjuster
  // x and y come from the mouse either over the preview or the editor
  // preview coordinates start at the separator (==> editorSize + ratio)
  // allow 25 pixels for the header (should be read from element)
  function adjustPanes(x, y, overPreview) {
    var ratio = isLeftRight ?
        (x / $outer.clientWidth) :
        ((overPreview ? y : y - 25) / ($outer.clientHeight - 25));
    var psize = overPreview ? editorSize + ratio * 100 : ratio * 100;
    if (psize >= 0) { resizeEditor(psize); }
  }

  // adjust editor window size between 0 and 100%
  //  0 means hide
  // -1 means restore last setting (or 50%)
  function resizeEditor(psize) {
    var force = false;
    if (psize === -1) {
      force = true;
      psize = max(10, editorSize || Number(localStorage.editorSize) || 50);
    } else {
      psize = psize % 100;
    }
    if (force || editorSize !== psize) {
      if (psize) { localStorage.editorSize = editorSize = psize; } // don't remember 0
      if (isLeftRight) {
        $('.left.col').css(  { width:  psize + '%', height: '100%' });
        $('.right.col').css( { width:  (100 - psize) + '%', height: '100%' });
        $('.handle').css( { left: psize + '%', top: '0' });
      } else {
        $('.top.row').css(   { height: psize + '%', width:  '100%' });
        $('.bottom.row').css({ height: 100 - psize + '%', width:  '100%' });
        $('.handle').css( { left: '0', top: ((psize / 100 * ($outer.clientHeight - 25)) + 25) + 'px' });
      }
    }
  }

  function max(x,y) { return x>y ? x : y; }

}
