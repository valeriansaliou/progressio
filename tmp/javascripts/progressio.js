
/*
Progressio
Authors: Valérian Saliou
Copyright: 2014, Valérian Saliou
 */

(function() {
  var ProgressioMisc, ProgressioPage, ProgressioRegistry, __,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  __ = window;

  ProgressioPage = (function() {
    function ProgressioPage() {}

    ProgressioPage.prototype.init = function() {
      var error;
      try {
        this._window_sel = $(window);
        this._document_sel = $(document);
        this._head = $('head');
        this._header_sel = $('header.headers');
        this._bluelines_sel = this._header_sel.find('.bluelines');
        this._id_async = 0;
        this._is_async_compatible = window.history && history.pushState && true;
        this._http_protocol = document.location.protocol.replace(':', '');
        this._http_host = document.location.host;
        return this._state_url = document.location.pathname;
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage.init', error);
      }
    };

    ProgressioPage.prototype.register = function() {
      var error;
      try {
        __.ProgressioRegistry.register_event('page:events_state_change', this.events_state_change, this);
        return __.ProgressioRegistry.register_event('page:async_load', this.events_async_load, this);
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage.register', error);
      }
    };

    ProgressioPage.prototype.purge_global_events = function() {
      var error;
      try {
        this._window_sel.off();
        return this._document_sel.off();
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage.purge_global_events', error);
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
        return Console.error('ProgressioPage.open_page', error);
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
              if (__.ProgressioMisc.key_event().ctrlKey || __.ProgressioMisc.key_event().metaKey) {
                return return_value = true;
              } else {
                return self._run_async_load($(this).attr('href'));
              }
            } catch (_error) {
              _error = _error;
              return Console.error('ProgressioPage.events_async_load[async]', _error);
            } finally {
              return return_value;
            }
          });
          eligible_links.attr('data-async', 'active');
          if (eligible_links_count) {
            return Console.debug('ProgressioPage.events_async_load', "Yay! " + eligible_links_count + " internal links ajax-ified.");
          }
        } else {
          return Console.error('ProgressioPage.events_async_load', 'Woops, your browser is not compatible with asynchronous page load!');
        }
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage.events_async_load', error);
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
        return Console.error('ProgressioPage.events_state_change', error);
      }
    };

    ProgressioPage.prototype.fire_dom_updated = function() {
      var error;
      try {
        return this.events_async_load('body');
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage.fire_dom_updated', error);
      }
    };

    ProgressioPage.prototype.get_id = function() {
      var error;
      try {
        return this._id_async;
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage.get_id', error);
      }
    };

    ProgressioPage.prototype._eligible_links_async_load = function() {
      var error, http_base, r_match;
      try {
        http_base = "" + this._http_protocol + "://" + this._http_host + "/";
        r_match = new RegExp("^(" + http_base + "|(/(?!https?://).*))", 'gi');
        return this._document_sel.find('a[href]:not([target="_blank"], [data-async="disabled"], [data-async="active"])').filter(function() {
          return $(this).attr('href').match(r_match);
        });
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._eligible_links_async_load', error);
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
        $.ajax({
          url: url,
          headers: {
            'X-Requested-With': 'async_page_loader'
          },
          type: 'GET',
          success: req_cb,
          error: req_cb
        });
        return Console.debug('ProgressioPage._run_async_load', "Loading page: " + url);
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._run_async_load', error);
      }
    };

    ProgressioPage.prototype._handle_async_load = function(id, url, data) {
      var callback_counter, cb_cleanup_fn, cb_complete_fn, cb_post_display_fn, data_sel, error, load_list, new_dom, old_namespaced_script_sel, old_namespaced_stylesheet_sel, self, title;
      try {
        self = this;
        if (typeof data === 'object' && data.hasOwnProperty('responseText')) {
          data = data.responseText;
        }
        if (id === this._id_async) {
          data_sel = $(data);
          new_dom = data_sel.filter('#body:first');
          if (new_dom.size()) {
            title = data_sel.filter('title:first');
            callback_counter = 0;
            old_namespaced_script_sel = this._document_sel.find('script:not([data-scope="common"])');
            old_namespaced_stylesheet_sel = this._document_sel.find('link[rel="stylesheet"]:not([data-scope="common"])');
            cb_cleanup_fn = function() {
              old_namespaced_script_sel.remove();
              old_namespaced_stylesheet_sel.remove();
              return Console.debug('ProgressioPage._handle_async_load', "Done cleanup of old DOM before page: " + url);
            };
            cb_post_display_fn = function() {
              self._end_progress_bar();
              self._scroll_top();
              self._document_sel.oneTime(250, function() {
                return __.LayoutComment.reset_last_hash();
              });
              return Console.debug('ProgressioPage._handle_async_load', "Done post display actions for page: " + url);
            };
            cb_complete_fn = function() {
              return self._document_sel.oneTime(250, function() {
                cb_cleanup_fn();
                self._document_sel.find('title').replaceWith(title);
                self._document_sel.find('#body').remove();
                self._document_sel.find('#body_new').attr('id', 'body').show();
                __.ProgressioRegistry.restore_events('#body');
                if (url !== self._state_url) {
                  self._state_url = url;
                  history.pushState(null, title, url);
                }
                cb_post_display_fn();
                return Console.debug('ProgressioPage._handle_async_load', "Loaded page: " + url);
              });
            };
            this.purge_global_events();
            __.ProgressioRegistry.unload_bundles();
            this._document_sel.find('#body_new').remove();
            new_dom.attr('id', 'body_new');
            new_dom.hide();
            new_dom.insertBefore(this._document_sel.find('#body'));
            this._head.append(data_sel.filter('script:not([src]):not([data-scope="common"])'));
            this._head.append(data_sel.filter('link[rel="stylesheet"]:not([href]):not([data-scope="common"])'));
            load_list = {
              js: [],
              css: []
            };
            data_sel.filter('script[src]:not([data-scope="common"])').each(function() {
              var script_src;
              script_src = $(this).attr('src');
              if (script_src) {
                return load_list.js.push(script_src);
              }
            });
            data_sel.filter('link[href][rel="stylesheet"]:not([data-scope="common"])').each(function() {
              var stylesheet_href;
              stylesheet_href = $(this).attr('href');
              if (stylesheet_href) {
                return load_list.css.push(stylesheet_href);
              }
            });
            if (load_list.js.length || load_list.css.length) {
              if (load_list.js.length) {
                callback_counter++;
                Console.info('ProgressioPage._handle_async_load', 'Loading scripts...');
                LazyLoad.js(load_list.js, function() {
                  Console.info('ProgressioPage._handle_async_load[async]', 'Scripts fully loaded');
                  if (--callback_counter === 0) {
                    return cb_complete_fn();
                  }
                });
              }
              if (load_list.css.length) {
                callback_counter++;
                Console.info('ProgressioPage._handle_async_load', 'Loading stylesheets...');
                LazyLoad.css(load_list.css, function() {
                  Console.info('ProgressioPage._handle_async_load[async]', 'Stylesheets fully loaded');
                  if (--callback_counter === 0) {
                    return cb_complete_fn();
                  }
                });
              }
              return Console.debug('ProgressioPage._handle_async_load', "Delayed page load (waiting for sources to be loaded first): " + url);
            } else {
              return cb_complete_fn();
            }
          } else {
            this._show_error_alert(10);
            this._end_progress_bar();
            return Console.error('ProgressioPage._handle_async_load', "Got an abnormal or error response from: " + url);
          }
        } else {
          return Console.warn('ProgressioPage._handle_async_load', "Dropped outpaced ID for page: " + url);
        }
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._handle_async_load', error);
      }
    };

    ProgressioPage.prototype._begin_progress_bar = function() {
      var error;
      try {
        this._bluelines_sel.stop(true);
        this._bluelines_sel.css({
          width: 0
        });
        this._bluelines_sel.addClass('animated');
        return this._bluelines_sel.animate({
          width: '50%'
        }, 600, 'easeOutQuad');
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._begin_progress_bar', error);
      }
    };

    ProgressioPage.prototype._end_progress_bar = function() {
      var error, self;
      try {
        self = this;
        return this._bluelines_sel.animate({
          width: '100%'
        }, 300, 'linear', function() {
          return self._bluelines_sel.removeClass('animated');
        });
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._end_progress_bar', error);
      }
    };

    ProgressioPage.prototype._get_error_alert = function() {
      var error;
      try {
        return this._document_sel.find('.alerts .async-load-error');
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._get_error_alert', error);
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
          return $(this).oneTime("" + seconds + "s", function() {
            return $(this).animate({
              height: 'toggle',
              opacity: 'toggle'
            }, 400);
          });
        });
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._show_error_alert', error);
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
        return Console.error('ProgressioPage._hide_error_alert', error);
      }
    };

    ProgressioPage.prototype._scroll_top = function() {
      var error, good_to_go;
      try {
        good_to_go = !__.LayoutComment.get_hash_id() && true;
        if (good_to_go) {
          return this._window_sel.scrollTop(0);
        }
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioPage._scroll_top', error);
      }
    };

    return ProgressioPage;

  })();

  ProgressioRegistry = (function() {
    function ProgressioRegistry() {}

    ProgressioRegistry.prototype.init = function() {
      var error;
      try {
        this._registry_events = {};
        return this._registry_bundles = [];
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.init', error);
      }
    };

    ProgressioRegistry.prototype.events = function() {
      var error;
      try {
        return this._bind_events('body');
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.events', error);
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
            _results.push(Console.debug('ProgressioRegistry._bind_events[loop]', "Bound callback function for " + ns));
          } catch (_error) {
            _error = _error;
            _results.push(Console.error('ProgressioRegistry._bind_events[loop]', "Registry callback function execution failed for " + ns + " with error message: " + _error));
          }
        }
        return _results;
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry._bind_events', error);
      }
    };

    ProgressioRegistry.prototype.register_event = function(namespace, fn_callback, fn_context, ignore_init) {
      var error;
      try {
        ignore_init = false || ignore_init;
        this._registry_events[namespace] = [fn_callback, fn_context, ignore_init];
        return Console.info('ProgressioRegistry.register_event', "Registered event: " + namespace);
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.register_event', error);
      }
    };

    ProgressioRegistry.prototype.unregister_event = function(namespace) {
      var error;
      try {
        if (__indexOf.call(this._registry_events, namespace) >= 0) {
          delete this._registry_events[namespace];
          Console.info('ProgressioRegistry.unregister_event', "Unregistered event: " + namespace);
          return true;
        }
        return false;
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.unregister_event', error);
      }
    };

    ProgressioRegistry.prototype.init_events = function() {
      var error;
      try {
        return this._bind_events('body');
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.init_events', error);
      }
    };

    ProgressioRegistry.prototype.restore_events = function(parent) {
      var error;
      try {
        return this._bind_events(parent);
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.restore_events', error);
      }
    };

    ProgressioRegistry.prototype.register_bundle = function(bundle) {
      var error;
      try {
        return this._registry_bundles.push(bundle);
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.register_bundle', error);
      }
    };

    ProgressioRegistry.prototype.unload_bundles = function() {
      var count_unload, cur_bundle, error, _i, _len, _ref;
      try {
        count_unload = 0;
        _ref = this._registry_bundles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cur_bundle = _ref[_i];
          if (__.hasOwnProperty(cur_bundle)) {
            delete _[cur_bundle];
            count_unload++;
          }
        }
        return Console.info('ProgressioRegistry.unload_bundles', "Unloaded " + count_unload + " bundles");
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioRegistry.unload_bundles', error);
      }
    };

    return ProgressioRegistry;

  })();

  ProgressioMisc = (function() {
    function ProgressioMisc() {}

    ProgressioMisc.prototype.init = function() {
      var error;
      try {
        this._window = $(window);
        return this._key_event = {};
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioMisc.init', error);
      }
    };

    ProgressioMisc.prototype.key_event = function() {
      var error;
      try {
        return this._key_event;
      } catch (_error) {
        error = _error;
        return Console.error('ProgressioMisc.key_event', error);
      }
    };

    return ProgressioMisc;

  })();

}).call(this);
