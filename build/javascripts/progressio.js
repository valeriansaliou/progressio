/**
 * progressio [uncompressed]
 * @fileoverview Beautiful & stylish asynchronous page loader. Makes a static website dynamic in a breeze.
 * 
 * @version 1.0.0
 * @date 2016-01-20
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license MPL-2.0
 * 
 * @url https://github.com/valeriansaliou/progressio
 * @repository git+https://github.com/valeriansaliou/progressio.git
*/


/*
Progressio

URL: https://github.com/valeriansaliou/progressio
Author: Valérian Saliou
Copyright: 2014, Valérian Saliou
 */

(function() {
  var is_progressio_applied, is_progressio_constructed,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  is_progressio_constructed = false;

  is_progressio_applied = false;

  window.Progressio = (function() {
    var ProgressioMisc, ProgressioPage, ProgressioRegistry;

    function Progressio(options) {
      var error;
      try {
        if (typeof options !== 'object') {
          options = {};
        }
        this._options = {
          color: options.color || 'blue',
          fixed: options.fixed || false,
          location: options.location || 'top',
          container: options.container || '#body',
          load_bar: options.load_bar || 'body',
          auto_hide: options.auto_hide || false,
          callbacks: options.callbacks || -1,
          console: options.console || -1
        };
        this._deps = {
          'jquery': jQuery,
          'jquery.timers': jQuery.timers
        };
        this._jQuery = this._deps.jquery;
        if (typeof this._options.console !== 'object') {
          this._options.console = {
            log: function() {},
            info: function() {},
            debug: function() {},
            warn: function() {},
            error: function() {},
            trace: function() {},
            timeEnd: function() {},
            time: function() {},
            group: function() {},
            groupCollapsed: function() {},
            groupEnd: function() {},
            dir: function() {},
            count: function() {}
          };
        }
        if (is_progressio_constructed === true) {
          throw new Error("Cannot instanciate Progressio more than once!");
        }
        this.ProgressioPage = new ProgressioPage(this, this._options, this._deps);
        this.ProgressioRegistry = new ProgressioRegistry(this, this._options, this._deps);
        this.ProgressioMisc = new ProgressioMisc(this, this._options, this._deps);
        this.ProgressioPage.register();
        this.ProgressioMisc.register();
        this.ProgressioRegistry.events();
        is_progressio_constructed = true;
      } catch (_error) {
        error = _error;
        this._options.console.error('Progressio.constructor', error);
      }
    }

    Progressio.prototype.apply = function() {
      var dep_name, dep_wrapper, error, _i, _len, _ref;
      try {
        this._options.console.info('Progressio.apply', 'Applying Progressio...');
        if (is_progressio_applied === true) {
          throw new Error("Cannot apply Progressio DOM more than once!");
        }
        _ref = this._deps;
        for (dep_wrapper = _i = 0, _len = _ref.length; _i < _len; dep_wrapper = ++_i) {
          dep_name = _ref[dep_wrapper];
          if (typeof dep_wrapper === 'undefined') {
            throw new Error("Could not find dependency: " + dep_name + "! Library load aborted.");
          }
        }
        this.color(this._options.color);
        is_progressio_applied = true;
        return this._options.console.info('Progressio.apply', 'Applied.');
      } catch (_error) {
        error = _error;
        return this._options.console.error('Progressio.apply', error);
      }
    };

    Progressio.prototype.color = function(to_color) {
      var color, color_class, container_class, container_sel, do_create, error, self;
      try {
        self = this;
        this._options.console.info('Progressio.color', "Changing bar color to " + to_color + "...");
        this._options.color = to_color || 'blue';
        do_create = true;
        container_sel = this._jQuery('.progressio-container');
        container_class = 'progressio-container';
        if (this._options.fixed === true) {
          container_class = "" + container_class + " progressio-position-fixed";
          if (this._options.location === 'bottom') {
            container_class = "" + container_class + " progressio-location-bottom";
          }
        }
        if (this._options.auto_hide === true) {
          container_class = "" + container_class + " progressio-visibility-hide";
        } else {
          container_class = "" + container_class + " progressio-visibility-show";
        }
        color = this._options.color || 'blue';
        color_class = "progressio-color-" + color;
        if (container_sel.size()) {
          if (container_sel.filter("." + color_class).size()) {
            do_create = false;
          } else {
            container_sel.remove();
          }
        }
        if (do_create === true) {
          this._loader_bar_sel = this._jQuery("<div class=\"progressio-bar\"></div>");
          this._loader_bar_container_sel = this._jQuery("<div class=\"" + container_class + " " + color_class + "\"></div>");
          this._loader_bar_container_sel.append(this._loader_bar_sel);
          this._jQuery(this._options.load_bar).prepend(this._loader_bar_container_sel);
          if (this._options.auto_hide === true) {
            this.ProgressioPage._begin_progress_bar(null, (function() {
              return self.ProgressioPage._end_progress_bar();
            }));
          }
          return this._options.console.info('Progressio.color', "Changed bar color to " + to_color + ".");
        }
      } catch (_error) {
        error = _error;
        return this._options.console.error('Progressio.color', error);
      }
    };

    Progressio.prototype.update = function() {
      var error;
      try {
        return this.ProgressioPage.fire_dom_updated();
      } catch (_error) {
        error = _error;
        return this._options.console.error('Progressio.update', error);
      }
    };

    Progressio.prototype.get_id = function() {
      var error;
      try {
        return this.ProgressioPage.get_id();
      } catch (_error) {
        error = _error;
        return this._options.console.error('Progressio.get_id', error);
      }
    };

    Progressio.prototype.open = function(url) {
      var error;
      try {
        return this.ProgressioPage.open_page(url);
      } catch (_error) {
        error = _error;
        return this._options.console.error('Progressio.open', error);
      }
    };

    Progressio.prototype.register_event = function(namespace, fn_callback, fn_context, ignore_init) {
      var error;
      try {
        return this.ProgressioRegistry.register_event(namespace, fn_callback, fn_context, ignore_init);
      } catch (_error) {
        error = _error;
        return this._options.console.error('Progressio.register_event', error);
      }
    };

    ProgressioPage = (function() {
      function ProgressioPage(parent, options, deps) {
        var error;
        try {
          this.__ = parent;
          this._options = options;
          this._jQuery = deps.jquery;
          this._window_sel = this._jQuery(window);
          this._document_sel = this._jQuery(document);
          this._head = this._jQuery('head');
          this._id_async = 0;
          this._is_async_compatible = window.history && history.pushState && true;
          this._http_protocol = document.location.protocol.replace(':', '');
          this._http_host = document.location.host;
          this._state_url = document.location.pathname;
        } catch (_error) {
          error = _error;
          this._options.console.error('Progressio.ProgressioPage.constructor', error);
        }
      }

      ProgressioPage.prototype.register = function() {
        var error;
        try {
          this.__.ProgressioRegistry.register_event('progressio:page:events_state_change', this.events_state_change, this);
          return this.__.ProgressioRegistry.register_event('progressio:page:async_load', this.events_async_load, this);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.register', error);
        }
      };

      ProgressioPage.prototype.purge_global_events = function() {
        var error;
        try {
          this._window_sel.off();
          return this._document_sel.off();
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.purge_global_events', error);
        }
      };

      ProgressioPage.prototype.open_page = function(url) {
        var error;
        try {
          if (this._is_async_compatible) {
            return this._run_async_load(url);
          } else {
            return document.location.href = url;
          }
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.open_page', error);
        }
      };

      ProgressioPage.prototype.events_async_load = function(parent) {
        var eligible_links, eligible_links_count, error, self;
        try {
          self = this;
          if (this._is_async_compatible) {
            eligible_links = this._eligible_links_async_load().hasParent(parent);
            eligible_links_count = eligible_links.size();
            eligible_links.click(function(evt) {
              var return_value, _error;
              return_value = false;
              try {
                if (self.__.ProgressioMisc.key_event().ctrlKey || self.__.ProgressioMisc.key_event().metaKey) {
                  return return_value = true;
                } else {
                  return self._run_async_load(self._jQuery(this).attr('href'));
                }
              } catch (_error) {
                _error = _error;
                return self._options.console.error('Progressio.ProgressioPage.events_async_load[async]', _error);
              } finally {
                return return_value;
              }
            });
            eligible_links.attr('data-progressio-async', 'active');
            if (eligible_links_count) {
              return this._options.console.debug('Progressio.ProgressioPage.events_async_load', "Yay! " + eligible_links_count + " internal links ajax-ified.");
            }
          } else {
            return this._options.console.error('Progressio.ProgressioPage.events_async_load', 'Woops, your browser is not compatible with asynchronous page load!');
          }
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.events_async_load', error);
        }
      };

      ProgressioPage.prototype.events_state_change = function() {
        var error, self, state_cb;
        try {
          self = this;
          state_cb = function(ev) {
            var new_state;
            new_state = document.location.pathname;
            if (new_state !== self._state_url) {
              self._state_url = new_state;
              return self._run_async_load(self._state_url);
            }
          };
          this._window_sel.off('popstate');
          this._window_sel.off('pushstate');
          this._window_sel.on('popstate', state_cb);
          return this._window_sel.on('pushstate', state_cb);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.events_state_change', error);
        }
      };

      ProgressioPage.prototype.fire_dom_updated = function() {
        var error;
        try {
          return this.events_async_load('body');
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.fire_dom_updated', error);
        }
      };

      ProgressioPage.prototype.get_id = function() {
        var error;
        try {
          return this._id_async;
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage.get_id', error);
        }
      };

      ProgressioPage.prototype._eligible_links_async_load = function() {
        var error, http_base, r_match, self;
        try {
          self = this;
          http_base = "" + this._http_protocol + "://" + this._http_host + "/";
          r_match = new RegExp("^(" + http_base + "|(\.?/(?!https?://).*))", 'gi');
          return this._document_sel.find('a[href]:not([target="_blank"], ' + '[data-progressio-async="disabled"], ' + '[data-progressio-async="active"])').filter(function() {
            return self._jQuery(this).attr('href').match(r_match);
          });
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._eligible_links_async_load', error);
        }
      };

      ProgressioPage.prototype._run_async_load = function(url) {
        var error, id, req_cb, self;
        try {
          self = this;
          this._begin_progress_bar();
          this._hide_error_alert();
          id = ++this._id_async;
          req_cb = function(data) {
            return self._handle_async_load(id, url, data);
          };
          this._jQuery.ajax({
            url: url,
            headers: {
              'X-Requested-With': 'Progressio'
            },
            type: 'GET',
            success: req_cb,
            error: req_cb
          });
          return this._options.console.debug('Progressio.ProgressioPage._run_async_load', "Loading page: " + url);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._run_async_load', error);
        }
      };

      ProgressioPage.prototype._handle_async_load = function(id, url, data) {
        var callback_counter, cb_cleanup_fn, cb_complete_fn, cb_post_display_fn, container_split, data_sel, error, load_list, new_dom, old_namespaced_script_sel, old_namespaced_stylesheet_sel, self, title;
        try {
          self = this;
          if (typeof data === 'object' && data.hasOwnProperty('responseText')) {
            data = data.responseText;
          }
          if (id === this._id_async) {
            data_sel = this._jQuery(data);
            new_dom = data_sel.filter("" + this._options.container + ":first");
            if (new_dom.size()) {
              title = data_sel.filter('title:first');
              callback_counter = 0;
              old_namespaced_script_sel = this._document_sel.find('script:not([data-progressio-scope="common"])');
              old_namespaced_stylesheet_sel = this._document_sel.find('link[rel="stylesheet"]:not([data-progressio-scope="common"])');
              cb_cleanup_fn = function() {
                old_namespaced_script_sel.remove();
                old_namespaced_stylesheet_sel.remove();
                return self._options.console.debug('Progressio.ProgressioPage._handle_async_load', "Done cleanup of old DOM before page: " + url);
              };
              cb_post_display_fn = function() {
                var cb_after;
                self._end_progress_bar();
                if (typeof self._options.callbacks === 'object' && typeof self._options.callbacks.post_display === 'object' && typeof self._options.callbacks.post_display.before === 'function' && self._options.callbacks.post_display.before() === true) {
                  self._scroll_top();
                  cb_after = self._options.callbacks.post_display.after;
                  if (cb_after === 'function') {
                    self._options.callbacks.post_display.after();
                  }
                }
                return self._options.console.debug('Progressio.ProgressioPage._handle_async_load', "Done post display actions for page: " + url);
              };
              cb_complete_fn = function() {
                return self._document_sel.oneTime(250, function() {
                  var cb_after, new_container, new_container_sel;
                  if (typeof self._options.callbacks === 'object' && typeof self._options.callbacks.on_complete === 'object' && typeof self._options.callbacks.on_complete.before === 'function' && self._options.callbacks.on_complete.before() === true) {
                    cb_after = self._options.callbacks.on_complete.after;
                    if (cb_after === 'function') {
                      self._options.callbacks.on_complete.after();
                    }
                  }
                  cb_cleanup_fn();
                  self._document_sel.find('title').replaceWith(title);
                  self._document_sel.find("" + self._options.container).remove();
                  new_container_sel = self._document_sel.find("" + self._options.container + "_new");
                  new_container = self.__.ProgressioMisc.split_selector_path(self._options.container);
                  new_container_sel.attr(new_container.attr, new_container.value).show();
                  self.__.ProgressioRegistry.restore_events("" + self._options.container);
                  if (url !== self._state_url) {
                    self._state_url = url;
                    history.pushState(null, title, url);
                  }
                  cb_post_display_fn();
                  return self._options.console.debug('Progressio.ProgressioPage._handle_async_load', "Loaded page: " + url);
                });
              };
              this.purge_global_events();
              this.__.ProgressioRegistry.unload_bundles();
              this._document_sel.find("" + this._options.container + "_new").remove();
              container_split = this.__.ProgressioMisc.split_selector_path(this._options.container);
              new_dom.attr(container_split.attr, "" + container_split.value + "_new");
              new_dom.hide();
              new_dom.insertBefore(this._document_sel.find("" + this._options.container));
              this._head.append(data_sel.filter('script:not([src])' + ':not([data-progressio-scope="common"])'));
              this._head.append(data_sel.filter('link[rel="stylesheet"]:not([href])' + ':not([data-progressio-scope="common"])'));
              load_list = {
                js: [],
                css: []
              };
              data_sel.filter('script[src]:not([data-progressio-scope="common"])').each(function() {
                var script_src;
                script_src = self._jQuery(this).attr('src');
                if (script_src) {
                  return load_list.js.push(script_src);
                }
              });
              data_sel.filter('link[href][rel="stylesheet"]' + ':not([data-progressio-scope="common"])').each(function() {
                var stylesheet_href;
                stylesheet_href = self._jQuery(this).attr('href');
                if (stylesheet_href) {
                  return load_list.css.push(stylesheet_href);
                }
              });
              if (load_list.js.length || load_list.css.length) {
                if (load_list.js.length) {
                  callback_counter++;
                  this._options.console.info('Progressio.ProgressioPage._handle_async_load', 'Loading scripts...');
                  LazyLoad.js(load_list.js, function() {
                    self._options.console.info('Progressio.ProgressioPage._handle_async_load[async]', 'Scripts fully loaded');
                    if (--callback_counter === 0) {
                      return cb_complete_fn();
                    }
                  });
                }
                if (load_list.css.length) {
                  callback_counter++;
                  this._options.console.info('Progressio.ProgressioPage._handle_async_load', 'Loading stylesheets...');
                  LazyLoad.css(load_list.css, function() {
                    self._options.console.info('Progressio.ProgressioPage._handle_async_load[async]', 'Stylesheets fully loaded');
                    if (--callback_counter === 0) {
                      return cb_complete_fn();
                    }
                  });
                }
                return this._options.console.debug('Progressio.ProgressioPage._handle_async_load', "Delayed page load (waiting for sources to be loaded): " + url);
              } else {
                return cb_complete_fn();
              }
            } else {
              this._show_error_alert(10);
              this._end_progress_bar();
              return this._options.console.error('Progressio.ProgressioPage._handle_async_load', "Got an abnormal or error response from: " + url);
            }
          } else {
            return this._options.console.warn('Progressio.ProgressioPage._handle_async_load', "Dropped outpaced ID for page: " + url);
          }
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._handle_async_load', error);
        }
      };

      ProgressioPage.prototype._begin_progress_bar = function(cb_start_fn, cb_finish_fn) {
        var error;
        try {
          this.__._loader_bar_sel.stop(true);
          this.__._loader_bar_sel.css({
            width: 0
          });
          if (this._options.auto_hide === true) {
            this.__._loader_bar_container_sel.stop(true);
            this.__._loader_bar_container_sel.fadeIn(250);
          }
          if (typeof cb_start_fn === 'function') {
            cb_start_fn();
          }
          this.__._loader_bar_sel.addClass('animated');
          return this.__._loader_bar_sel.animate({
            width: '50%'
          }, 600, 'easeOutQuad', (function() {
            if (typeof cb_finish_fn === 'function') {
              return cb_finish_fn();
            }
          }));
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._begin_progress_bar', error);
        }
      };

      ProgressioPage.prototype._end_progress_bar = function(cb_start_fn, cb_finish_fn) {
        var error, self;
        try {
          self = this;
          if (typeof cb_start_fn === 'function') {
            cb_start_fn();
          }
          return this.__._loader_bar_sel.animate({
            width: '100%'
          }, 300, 'linear', (function() {
            self.__._loader_bar_sel.removeClass('animated');
            if (self._options.auto_hide === true) {
              self.__._loader_bar_container_sel.stop(true);
              self.__._loader_bar_container_sel.fadeOut(400);
            }
            if (typeof cb_finish_fn === 'function') {
              return cb_finish_fn();
            }
          }));
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._end_progress_bar', error);
        }
      };

      ProgressioPage.prototype._get_error_alert = function() {
        var error;
        try {
          return this._document_sel.find('.alerts .async-load-error');
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._get_error_alert', error);
        }
      };

      ProgressioPage.prototype._show_error_alert = function(seconds) {
        var error, error_alert_sel;
        if (seconds == null) {
          seconds = 10;
        }
        try {
          error_alert_sel = this._get_error_alert();
          error_alert_sel.stop(true).hide();
          return error_alert_sel.animate({
            height: 'toggle',
            opacity: 'toggle'
          }, 400, function() {
            return this._jQuery(this).oneTime("" + seconds + "s", function() {
              return this._jQuery(this).animate({
                height: 'toggle',
                opacity: 'toggle'
              }, 400);
            });
          });
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._show_error_alert', error);
        }
      };

      ProgressioPage.prototype._hide_error_alert = function() {
        var error, error_alert_visible_sel;
        try {
          error_alert_visible_sel = this._get_error_alert().filter(':visible');
          if (error_alert_visible_sel.size()) {
            error_alert_visible_sel.stopTime();
            return error_alert_visible_sel.stop(true).animate({
              height: 'toggle',
              opacity: 'toggle'
            }, 250);
          }
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._hide_error_alert', error);
        }
      };

      ProgressioPage.prototype._scroll_top = function() {
        var error;
        try {
          return this._window_sel.scrollTop(0);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioPage._scroll_top', error);
        }
      };

      return ProgressioPage;

    })();

    ProgressioRegistry = (function() {
      function ProgressioRegistry(parent, options, deps) {
        var error;
        try {
          this.__ = parent;
          this._options = options;
          this._jQuery = deps.jquery;
          this._registry_events = {};
          this._registry_bundles = [];
        } catch (_error) {
          error = _error;
          this._options.console.error('Progressio.ProgressioRegistry.constructor', error);
        }
      }

      ProgressioRegistry.prototype.events = function() {
        var error;
        try {
          return this._bind_events('body');
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.events', error);
        }
      };

      ProgressioRegistry.prototype._bind_events = function(parent) {
        var cur_registry, error, is_init, ns, _error, _ref, _results;
        try {
          parent = parent || 'body';
          is_init = parent === 'body';
          cur_registry = null;
          _ref = this._registry_events;
          _results = [];
          for (ns in _ref) {
            cur_registry = _ref[ns];
            try {
              if (!(is_init && cur_registry[2])) {
                (cur_registry[0].bind(cur_registry[1]))(parent);
              }
              _results.push(this._options.console.debug('Progressio.ProgressioRegistry._bind_events[loop]', "Bound callback function for " + ns));
            } catch (_error) {
              _error = _error;
              _results.push(this._options.console.error('Progressio.ProgressioRegistry._bind_events[loop]', "Registry callback function execution failed for " + ("" + ns + " with error message: " + _error)));
            }
          }
          return _results;
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry._bind_events', error);
        }
      };

      ProgressioRegistry.prototype.register_event = function(namespace, fn_callback, fn_context, ignore_init) {
        var error;
        try {
          ignore_init = false || ignore_init;
          this._registry_events[namespace] = [fn_callback, fn_context, ignore_init];
          return this._options.console.info('Progressio.ProgressioRegistry.register_event', "Registered event: " + namespace);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.register_event', error);
        }
      };

      ProgressioRegistry.prototype.unregister_event = function(namespace) {
        var error;
        try {
          if (__indexOf.call(this._registry_events, namespace) >= 0) {
            delete this._registry_events[namespace];
            this._options.console.info('Progressio.ProgressioRegistry.unregister_event', "Unregistered event: " + namespace);
            return true;
          }
          return false;
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.unregister_event', error);
        }
      };

      ProgressioRegistry.prototype.init_events = function() {
        var error;
        try {
          return this._bind_events('body');
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.init_events', error);
        }
      };

      ProgressioRegistry.prototype.restore_events = function(parent) {
        var error;
        try {
          return this._bind_events(parent);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.restore_events', error);
        }
      };

      ProgressioRegistry.prototype.register_bundle = function(bundle) {
        var error;
        try {
          return this._registry_bundles.push(bundle);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.register_bundle', error);
        }
      };

      ProgressioRegistry.prototype.unload_bundles = function() {
        var count_unload, cur_bundle, error, _i, _len, _ref;
        try {
          count_unload = 0;
          _ref = this._registry_bundles;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cur_bundle = _ref[_i];
            if (this.hasOwnProperty(cur_bundle)) {
              delete _[cur_bundle];
              count_unload++;
            }
          }
          return this._options.console.info('Progressio.ProgressioRegistry.unload_bundles', "Unloaded " + count_unload + " bundles");
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioRegistry.unload_bundles', error);
        }
      };

      return ProgressioRegistry;

    })();

    ProgressioMisc = (function() {
      function ProgressioMisc(parent, options, deps) {
        var error;
        try {
          this.__ = parent;
          this._options = options;
          this._jQuery = deps.jquery;
          this._window_sel = this._jQuery(window);
          this._key_event = {};
        } catch (_error) {
          error = _error;
          this._options.console.error('Progressio.ProgressioMisc.constructor', error);
        }
      }

      ProgressioMisc.prototype.register = function() {
        var error;
        try {
          return this.__.ProgressioRegistry.register_event('progressio:misc:events_key', this.events_key, this);
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioMisc.register', error);
        }
      };

      ProgressioMisc.prototype.events_key = function() {
        var error, self;
        try {
          self = this;
          this._window_sel.keydown(function(evt) {
            return self._key_event = evt;
          });
          return this._window_sel.keyup(function() {
            return self._key_event = {};
          });
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioMisc.events_key', error);
        }
      };

      ProgressioMisc.prototype.key_event = function() {
        var error;
        try {
          return this._key_event;
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioMisc.key_event', error);
        }
      };

      ProgressioMisc.prototype.split_selector_path = function(selector_path) {
        var error, selector_path_arr, selector_path_type;
        selector_path_arr = {
          attr: 'data-selector',
          value: null
        };
        try {
          selector_path_type = selector_path.substr(0, 1);
          selector_path_arr.value = selector_path.substr(1, selector_path.length);
          switch (selector_path_type) {
            case '#':
              selector_path_arr.attr = 'id';
              break;
            case '.':
              selector_path_arr.attr = 'class';
              break;
          }
        } catch (_error) {
          error = _error;
          return this._options.console.error('Progressio.ProgressioMisc.split_selector_path', error);
        } finally {
          return selector_path_arr;
        }
      };

      return ProgressioMisc;

    })();

    return Progressio;

  })();

}).call(this);
