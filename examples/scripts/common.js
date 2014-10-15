/*
  Progressio

  @fileoverview Scripts (common)

  @url https://github.com/valeriansaliou/progressio
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

$(document).ready(function() {
  // Launch progressio
  (new Progressio({
    color: 'blue',
    console: Console,
  })).apply();
});
