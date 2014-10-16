/*
  Progressio

  @fileoverview Scripts (common)

  @url https://github.com/valeriansaliou/progressio
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

// Launch Progressio
$(document).ready(function() {
  var color_select_sel = $('select[name="progressio_color"]');

  // Change color
  color_select_sel.change(function() {
    (new Progressio({
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
    })).apply();
  });

  // Launch Progressio
  color_select_sel.change();
});
