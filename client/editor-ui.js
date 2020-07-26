/*
 * editor-ui.js
 * browserify entry point for pub-pkg-editor user interface
 *
 * - depends on jquery
 * - uses iframe containing website layout for preview with 2 editing modes
 * - edit-mode captures clicks purely for selecting areas of content to edit
 * - nav-mode makes the iframe work just like a normal website
 *
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
*/

var humane = require('humane-js').create({ waitForMove:true });

window.onGeneratorLoaded = function editorUI(generator) {

  var opts = generator.opts;
  var u = generator.util;

  var log = opts.log;

  var origin = location.href.replace(/^(.*?:\/\/[^\/]+)\/.*$/,'$1' + opts.staticRoot + opts.editorPrefix);

  var $outer = $('.outer').get(0); // outermost div - for width and height

  var editor =
    { $name:    $('.name'),            // jquery name area in header
      $edit:    $('textarea.editor'),  // jquery editor textarea
      $updates: $('.updateslist'),
      $uploads: $('.uploadsform'),

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

  var onIOS = /iPad|iPhone/i.test(navigator.userAgent);
  $(window).on(onIOS ? "pagehide" : "beforeunload", function() {
    log('beforeunload')
    forceSave();
  });

  $('.commitbutton').click(toggleUpdates);
  $('.editbutton').click(toggleFragments);
  $('.menubutton').click(toggleUploads);
  $('.name').click(revertEdits);
  $('.helpbutton').click(help);

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

  // called before unload or file commit/revert
  function forceSave() {
    generator.clientSaveHoldText();
    generator.clientSaveUnThrottled();
  }

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

    pRef = pwindow.pubRef || {};
    var relPath = pRef.relPath || '';

    $css = p$('<link rel="stylesheet" href="' + relPath + '/pub/css/pub-preview.css">');
    p$('head').append($css);
    $css.get(0).disabled = true;

    var $script = p$('<script src="' + relPath + '/pub/js/pub-preview.js"></script>');
    p$('body').append($script);

    p$.editorLoaded = true;
    clearInterval(previewPoller);
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
      toggleFragments();  // single fragment select less confusing
      e.preventDefault(); // will also stop pager because it checks for e.defaultPrevented
    }
  }

  // navigation handler
  function handleNav(path, query, hash) {
    if (path) {
      history.replaceState(null, null, origin + path + (query || '') + (hash || ''));
      bindEditor(generator.fragment$[path + hash]);
    }
    else {
      // reload
      bindEditor(generator.fragment$[editor.binding]);
    }
    hideControls();
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
      showIfModified();
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
    var pos = editor.$edit.get(0).selectionStart;
    var $newedit = editor.$edit.clone().val(text);
    var newedit = $newedit.get(0);
    editor.$edit.replaceWith($newedit);
    editor.$edit = $newedit;
    $newedit.on('keyup', editorUpdate);
    newedit.selectionStart = pos;
    newedit.selectionEnd = pos;
    editor.$edit.focus(hideControls).focus();
  }

  // register updates from editor using editor.binding
  function editorUpdate() {
    if (editor.binding) {
      if ('hold' === generator.clientUpdateFragmentText(editor.binding, editor.$edit.val())) {
        editor.holding = true;
      }
      showIfModified();
    }
  }

  function showIfModified() {
    if (generator.isFragmentModified(editor.binding)) { editor.$name.addClass('modified') }
    else { editor.$name.removeClass('modified'); }
  }

  function revertEdits() {
    if (generator.isFragmentModified(editor.binding) && confirm('Are you sure you want to revert the edits from this session?')) {
      generator.revertFragmentState(editor.binding);
      showIfModified();
    }
  }

  // save with breakHold - may result in modified href ==> loss of binding context?
  function saveBreakHold() {
    if (editor.binding && editor.holding) {
      generator.clientUpdateFragmentText(editor.binding, editor.$edit.val(), true);
      editor.holding = false;
    }
  }

  function toggleUpdates() {
    if (toggleControls(editor.$updates)) {
      refreshUpdates(); // get latest updates when opening updates.
    }
    editor.$uploads.hide();
  }

  function toggleUploads() {
    toggleControls(editor.$uploads);
    editor.$updates.hide();
  }

  function toggleControls($x) {
    if (!$x.is(':hidden')) {
      $x.slideUp(150);
      editor.$edit.removeClass('showcontrols');
      return false;
    }
    else {
      editor.$edit.addClass('showcontrols');
      $x.slideDown(150);
      return true;
    }
  }

  function hideControls() {
    editor.$updates.slideUp(150);
    editor.$uploads.slideUp(150);
    editor.$edit.removeClass('showcontrols');
  }

  function refreshUpdates() {
    forceSave();
    $.getJSON('/admin/pub-editor-diffs', function(data) {
      var html = generator.renderTemplate( {
        _href: '/pub-editor-updates',
        name: data.length + ' Updates',
        diffs: data },
      'pub-editor-updates')
      var li$ = editor.$updates.html(html).find('li');
      li$.click(function() {
        var href = $(this).attr('data-href');
        if (href) pwindow.pager(href);
      });
      li$.find('span.diffcommit').click(function() {
        var path = $(this).parent().attr('data-file');
        var difftext = $(this).parent().attr('title').slice(24);
        if (confirm('Confirm commit:\n' + difftext + '\n')) {
          $.post('/admin/pub-editor-commit', { path:path }, function() {
            generator.emit('notify', 'Commit ' + path + ' OK');
          }).fail(function(resp) {
            generator.emit('notify', 'Commit failed, please reload browser and try again.\n' + resp.responseText);
          });
          hideControls();
          return false;
        }
      });
      li$.find('span.diffrevert').click(function() {
        var path = $(this).parent().attr('data-file');
        var difftext = $(this).parent().attr('title').slice(24);
        if (confirm('Confirm revert:\n' + difftext + '\n')) {
          $.post('/admin/pub-editor-revert', { path:path }, function() {
            location.reload(); // brute force client reset after file-revert
          }).fail(function(resp) {
            generator.emit('notify', 'Revert failed, please reload browser and try again.\n' + resp.responseText);
          });
          hideControls();
          return false;
        }
      });
    });
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

  function help() {
    pwindow.pager(generator.page$['/help'] ? '/help' : '/pub-editor-help');
  }
}
