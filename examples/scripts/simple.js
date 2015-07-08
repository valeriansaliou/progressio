/*
  Progressio

  @fileoverview Scripts (simple)

  @url https://github.com/valeriansaliou/progressio
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

var PROGRESSIO_INSTANCE;


var fn_change_event = function() {
  var color_select_sel = $('select[name="progressio_color"]');

  color_select_sel.change(function() {
    PROGRESSIO_INSTANCE.color(
      color_select_sel.val()
    );
  });
};


// Launch Progressio
$(document).ready(function() {
  // Apply Progressio
  PROGRESSIO_INSTANCE = (new Progressio({
    color: $('select[name="progressio_color"]').val(),

    fixed: true,
    location: 'top',
    container: '#body',
    load_bar: '#progressio',
    auto_hide: false,

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
  fn_change_event();

  // Register change event restore
  PROGRESSIO_INSTANCE.register_event(
    "simple:fn_change_event", fn_change_event, this, true
  );
});
