/*
 * jQuery hasParent
 *
 * URL: https://github.com/valeriansaliou/jquery.hasparent
 * Author: Valerian Saliou
 * License: MIT
 *
 * Copyright 2014, Valerian Saliou
 *
 * Version: v1.0.0
 * Date: Fri Oct 16, 2014
 */

jQuery.extend(jQuery.fn, {
  hasParent: function(p) {
    return this.filter(function() {
      // Return truthy/falsey based on presence of parent in upward tree
      return $(this).parents(p).size();
    });
  }
});
