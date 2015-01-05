/*
  Progressio

  @fileoverview Scripts (simple)

  @url https://github.com/valeriansaliou/progressio
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

var PROGRESSIO_INSTANCE;

// Launch Progressio
$(document).ready(function() {
  var color_select_sel = $('select[name="progressio_color"]');

  // Apply Progressio
  PROGRESSIO_INSTANCE = (new Progressio({
    color: color_select_sel.val(),

    fixed: true,
    location: 'top',
    container: '#content',

    callbacks: {
      post_display: {
        before: function() {},
        after: function() {}
      },

      on_complete: {
        before: function() {},
        after: function() {}
      }
    },

    console: Console,
  }));

  PROGRESSIO_INSTANCE.apply();

  // Change Progressio bar color
  color_select_sel.change(function() {
    PROGRESSIO_INSTANCE.color(
      color_select_sel.val()
    );
  });
});
