###
Progressio

URL: https://github.com/valeriansaliou/progressio
Author: Valérian Saliou
Copyright: 2014, Valérian Saliou
###



is_progressio_constructed = false
is_progressio_applied     = false


class window.Progressio
  # Main constructor
  constructor: (options) ->
    try
      # Initialize options
      unless typeof options is 'object'
        options = {}

      @_options =
        color      : (options.color      or 'blue')
        fixed      : (options.fixed      or false)
        location   : (options.location   or 'top')
        container  : (options.container  or '#body')
        load_bar   : (options.load_bar   or 'body')
        auto_hide  : (options.auto_hide  or false)
        callbacks  : (options.callbacks  or -1)
        console    : (options.console    or -1)

      # Store shared libs
      @_deps    =
        'jquery'        : jQuery
        'jquery.timers' : jQuery.timers

      @_jQuery = @_deps.jquery

      unless typeof @_options.console is 'object'
        @_options.console =
          log            : -> return
          info           : -> return
          debug          : -> return
          warn           : -> return
          error          : -> return
          trace          : -> return
          timeEnd        : -> return
          time           : -> return
          group          : -> return
          groupCollapsed : -> return
          groupEnd       : -> return
          dir            : -> return
          count          : -> return

      # Already constructed?
      if is_progressio_constructed is true
        throw new Error(
          "Cannot instanciate Progressio more than once!"
        )

      # Child classes (instanciate)
      @ProgressioPage      = new ProgressioPage @, @_options, @_deps
      @ProgressioRegistry  = new ProgressioRegistry @, @_options, @_deps
      @ProgressioMisc      = new ProgressioMisc @, @_options, @_deps

      # Launch the Progressio wrapper :)
      @ProgressioPage.register()
      @ProgressioRegistry.events()

      # Done constructing!
      is_progressio_constructed = true
    catch error
      @_options.console.error 'Progressio.constructor', error


  apply: ->
    try
      @_options.console.info(
        'Progressio.apply', 'Applying Progressio...'
      )

      # Already applied?
      if is_progressio_applied is true
        throw new Error(
          "Cannot apply Progressio DOM more than once!"
        )

      # Check for deps
      for dep_name, dep_wrapper in @_deps
        if typeof dep_wrapper is 'undefined'
          throw new Error(
            "Could not find dependency: #{dep_name}! Library load aborted."
          )

      # Create markup
      @color @_options.color

      # Done applying!
      is_progressio_applied = true

      @_options.console.info 'Progressio.apply', 'Applied.'
    catch error
      @_options.console.error 'Progressio.apply', error


  color: (to_color) ->
    try
      self = @

      @_options.console.info(
        'Progressio.color', "Changing bar color to #{to_color}..."
      )

      @_options.color = (to_color or 'blue')

      do_create = true

      container_sel = @_jQuery '.progressio-container'
      container_class = 'progressio-container'

      if @_options.fixed is true
        container_class = "#{container_class} progressio-position-fixed"

        if @_options.location is 'bottom'
          container_class = "#{container_class} progressio-location-bottom"

      if @_options.auto_hide is true
        container_class = "#{container_class} progressio-visibility-hide"
      else
        container_class = "#{container_class} progressio-visibility-show"

      color = @_options.color or 'blue'
      color_class = "progressio-color-#{color}"

      if container_sel.size()
        if container_sel.filter(".#{color_class}").size()
          do_create = false
        else
          container_sel.remove()

      if do_create is true
        @_loader_bar_sel = @_jQuery(
          """
          <div class="progressio-bar"></div>
          """
        )

        @_loader_bar_container_sel = @_jQuery(
          """
          <div class="#{container_class} #{color_class}"></div>
          """
        )

        @_loader_bar_container_sel.append @_loader_bar_sel

        @_jQuery(@_options.load_bar).prepend(
          @_loader_bar_container_sel
        )

        # Animate initial load?
        if @_options.auto_hide is true
          @ProgressioPage._begin_progress_bar(
            null,
            (-> self.ProgressioPage._end_progress_bar())
          )

        @_options.console.info(
          'Progressio.color', "Changed bar color to #{to_color}."
        )
    catch error
      @_options.console.error 'Progressio.color', error


  update: ->
    try
      @ProgressioPage.fire_dom_updated()
    catch error
      @_options.console.error 'Progressio.update', error


  get_id: ->
    try
      return @ProgressioPage.get_id()
    catch error
      @_options.console.error 'Progressio.get_id', error


  open: (url) ->
    try
      @ProgressioPage.open_page url
    catch error
      @_options.console.error 'Progressio.open', error


  register_event: (namespace, fn_callback, fn_context, ignore_init) ->
    try
      @ProgressioRegistry.register_event(
        namespace, fn_callback, fn_context, ignore_init
      )
    catch error
      @_options.console.error 'Progressio.register_event', error



  # Child classes (define)
  class ProgressioPage
    constructor: (parent, options, deps) ->
      try
        # Configuration
        @__       = parent
        @_options = options
        @_jQuery  = deps.jquery

        # Selectors
        @_window_sel = @_jQuery window
        @_document_sel = @_jQuery document
        @_head = @_jQuery 'head'

        # States
        @_id_async = 0

        # Variables
        @_is_async_compatible = (window.history and history.pushState and true)
        @_http_protocol = document.location.protocol.replace ':', ''
        @_http_host = document.location.host
        @_state_url = document.location.pathname
      catch error
        @_options.console.error 'Progressio.ProgressioPage.constructor', error


    register: ->
      try
        @__.ProgressioRegistry.register_event(
          'page:events_state_change', @events_state_change, @
        )

        @__.ProgressioRegistry.register_event(
          'page:async_load', @events_async_load, @
        )
      catch error
        @_options.console.error 'Progressio.ProgressioPage.register', error


    purge_global_events: ->
      try
        @_window_sel.off()
        @_document_sel.off()
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage.purge_global_events', error
        )


    open_page: (url) ->
      try
        if @_is_async_compatible
          @_run_async_load url
        else
          document.location.href = url
      catch error
        @_options.console.error 'Progressio.ProgressioPage.open_page', error


    events_async_load: (parent) ->
      try
        self = @

        if @_is_async_compatible
          eligible_links = @_eligible_links_async_load().hasParent parent
          eligible_links_count = eligible_links.size()

          eligible_links.click (evt) ->
            return_value = false

            try
              # Used by some to open up the target page in a new tab rather
              if self.__.ProgressioMisc.key_event().ctrlKey or \
                 self.__.ProgressioMisc.key_event().metaKey
                return_value = true
              else
                self._run_async_load (self._jQuery(this).attr 'href')
            catch _error
              self._options.console.error(
                'Progressio.ProgressioPage.events_async_load[async]', _error
              )
            finally
              return return_value

          # Lock down further async load events on those links...
          eligible_links.attr 'data-progressio-async', 'active'

          if eligible_links_count
            @_options.console.debug(
              'Progressio.ProgressioPage.events_async_load',
              "Yay! #{eligible_links_count} internal links ajax-ified."
            )
        else
          @_options.console.error(
            'Progressio.ProgressioPage.events_async_load',
            'Woops, your browser is not compatible with asynchronous page load!'
          )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage.events_async_load', error
        )


    events_state_change: ->
      try
        self = @

        # State change callback function
        state_cb = (ev) ->
          new_state = document.location.pathname

          if new_state isnt self._state_url
            self._state_url = new_state
            self._run_async_load self._state_url

        # Unbind previous state handlers
        @_window_sel.off 'popstate'
        @_window_sel.off 'pushstate'

        # Re-bind state handlers
        @_window_sel.on 'popstate', state_cb
        @_window_sel.on 'pushstate', state_cb
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage.events_state_change', error
        )


    fire_dom_updated: ->
      try
        @events_async_load 'body'
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage.fire_dom_updated', error
        )


    get_id: ->
      try
        return @_id_async
      catch error
        @_options.console.error 'Progressio.ProgressioPage.get_id', error


    _eligible_links_async_load: ->
      try
        self = @

        http_base = "#{@_http_protocol}://#{@_http_host}/"
        r_match = new RegExp "^(#{http_base}|(\.?/(?!https?://).*))", 'gi'

        return @_document_sel.find(
          'a[href]:not([target="_blank"], ' +\
          '[data-progressio-async="disabled"], ' +\
          '[data-progressio-async="active"])'
        ).filter ->
          return self._jQuery(this).attr('href').match r_match
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._eligible_links_async_load', error
        )


    _run_async_load: (url) ->
      try
        self = @

        @_begin_progress_bar()
        @_hide_error_alert()

        id = ++@_id_async

        req_cb = (data) ->
          self._handle_async_load id, url, data

        @_jQuery.ajax(
          url: url
          headers:
            'X-Requested-With': 'Progressio'
          type: 'GET'
          success: req_cb
          error: req_cb
        )

        @_options.console.debug(
          'Progressio.ProgressioPage._run_async_load', "Loading page: #{url}"
        )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._run_async_load', error
        )


    _handle_async_load: (id, url, data) ->
      try
        self = @

        # Typical of a non-200 HTTP response (error response)
        if typeof data is 'object' and data.hasOwnProperty 'responseText'
          data = data.responseText

        if id is @_id_async
          data_sel = @_jQuery data
          new_dom = data_sel.filter "#{@_options.container}:first"

          # Valid response?
          if new_dom.size()
            # Read some values
            title = data_sel.filter 'title:first'

            # Callback functions
            callback_counter = 0
            old_namespaced_script_sel = @_document_sel.find(
              'script:not([data-progressio-scope="common"])'
            )
            old_namespaced_stylesheet_sel = @_document_sel.find(
              'link[rel="stylesheet"]:not([data-progressio-scope="common"])'
            )

            cb_cleanup_fn = ->
              # Purge old scripts
              old_namespaced_script_sel.remove()
              old_namespaced_stylesheet_sel.remove()

              self._options.console.debug(
                'Progressio.ProgressioPage._handle_async_load',
                "Done cleanup of old DOM before page: #{url}"
              )

            cb_post_display_fn = ->
              # Finish load, happily! :)
              self._end_progress_bar()

              if typeof self._options.callbacks \
                  is 'object' and \
                 typeof self._options.callbacks.post_display \
                  is 'object' and \
                 typeof self._options.callbacks.post_display.before \
                  is 'function' and \
                 self._options.callbacks.post_display.before() \
                  is true
                self._scroll_top()

                cb_after = self._options.callbacks.post_display.after

                if cb_after is 'function'
                  self._options.callbacks.post_display.after()

              self._options.console.debug(
                'Progressio.ProgressioPage._handle_async_load',
                "Done post display actions for page: #{url}"
              )

            cb_complete_fn = ->
              # Wait a little bit (DOM rendering lag and other joys!)
              self._document_sel.oneTime(
                250,
                ->
                  if typeof self._options.callbacks \
                      is 'object' and \
                     typeof self._options.callbacks.on_complete \
                      is 'object' and \
                     typeof self._options.callbacks.on_complete.before \
                      is 'function' and \
                     self._options.callbacks.on_complete.before() is true
                    cb_after = self._options.callbacks.on_complete.after

                    if cb_after is 'function'
                      self._options.callbacks.on_complete.after()

                  # Cleanup DOM
                  cb_cleanup_fn()

                  self._document_sel.find('title').replaceWith title

                  self._document_sel.find(
                    "#{self._options.container}"
                  ).remove()

                  new_container_sel = self._document_sel.find(
                    "#{self._options.container}_new"
                  )

                  # Autodetect whether the selector is an ID or a class
                  new_container = self.__.ProgressioMisc.split_selector_path(
                    self._options.container
                  )

                  new_container_sel.attr(
                    new_container.attr, new_container.value
                  ).show()

                  # Restore DOM events
                  self.__.ProgressioRegistry.restore_events(
                    "#{self._options.container}"
                  )

                  # All done, now pushing to the history
                  if url isnt self._state_url
                    self._state_url = url
                    history.pushState null, title, url

                  # Trigger post-display events
                  cb_post_display_fn()

                  self._options.console.debug(
                    'Progressio.ProgressioPage._handle_async_load',
                    "Loaded page: #{url}"
                  )
              )

            # Purge old environment
            @purge_global_events()
            @__.ProgressioRegistry.unload_bundles()

            # Append new DOM (in a temporary-hidden fashion)
            @_document_sel.find("#{@_options.container}_new").remove()

            container_split = @__.ProgressioMisc.split_selector_path(
              @_options.container
            )

            new_dom.attr(
              container_split.attr, "#{container_split.value}_new"
            )

            new_dom.hide()
            new_dom.insertBefore(
              @_document_sel.find "#{@_options.container}"
            )

            # Items to be appended directly
            @_head.append(
              data_sel.filter 'script:not([src])' +\
              ':not([data-progressio-scope="common"])'
            )

            @_head.append(
              data_sel.filter(
                'link[rel="stylesheet"]:not([href])' +\
                ':not([data-progressio-scope="common"])'
              )
            )

            # Items to load
            load_list =
              js: [],
              css: []

            data_sel.filter(
              'script[src]:not([data-progressio-scope="common"])'
            ).each ->
              script_src = self._jQuery(this).attr 'src'

              if script_src
                load_list.js.push script_src

            data_sel.filter(
              'link[href][rel="stylesheet"]' +\
              ':not([data-progressio-scope="common"])'
            ).each ->
              stylesheet_href = self._jQuery(this).attr 'href'

              if stylesheet_href
                load_list.css.push stylesheet_href

            if load_list.js.length or load_list.css.length
              # Load new deps (finish page load once done)
              if load_list.js.length
                callback_counter++

                @_options.console.info(
                  'Progressio.ProgressioPage._handle_async_load',
                  'Loading scripts...'
                )

                LazyLoad.js(
                  load_list.js,
                  ->
                    self._options.console.info(
                      'Progressio.ProgressioPage._handle_async_load[async]',
                      'Scripts fully loaded'
                    )

                    if --callback_counter is 0
                      cb_complete_fn()
                )

              if load_list.css.length
                callback_counter++

                @_options.console.info(
                  'Progressio.ProgressioPage._handle_async_load',
                  'Loading stylesheets...'
                )

                LazyLoad.css(
                  load_list.css,
                  ->
                    self._options.console.info(
                      'Progressio.ProgressioPage._handle_async_load[async]',
                      'Stylesheets fully loaded'
                    )

                    if --callback_counter is 0
                      cb_complete_fn()
                )

              @_options.console.debug(
                'Progressio.ProgressioPage._handle_async_load',
                "Delayed page load (waiting for sources to be loaded): #{url}"
              )
            else
              cb_complete_fn()
          else
            @_show_error_alert(10)
            @_end_progress_bar()

            @_options.console.error(
              'Progressio.ProgressioPage._handle_async_load',
              "Got an abnormal or error response from: #{url}"
            )
        else
          @_options.console.warn(
            'Progressio.ProgressioPage._handle_async_load',
            "Dropped outpaced ID for page: #{url}"
          )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._handle_async_load', error
        )


    _begin_progress_bar: (cb_start_fn, cb_finish_fn) ->
      try
        # Reset progress bar
        @__._loader_bar_sel.stop true
        @__._loader_bar_sel.css
          width: 0

        # Reveal progress bar?
        if @_options.auto_hide is true
          @__._loader_bar_container_sel.stop true
          @__._loader_bar_container_sel.fadeIn 250

        # Animate progress bar!
        if typeof cb_start_fn is 'function'
          cb_start_fn()

        @__._loader_bar_sel.addClass 'animated'
        @__._loader_bar_sel.animate(
          width: '50%',
          600,
          'easeOutQuad',
          ( ->
            if typeof cb_finish_fn is 'function'
              cb_finish_fn()
          )
        )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._begin_progress_bar', error
        )


    _end_progress_bar: (cb_start_fn, cb_finish_fn) ->
      try
        self = @

        # Animate progress bar!
        if typeof cb_start_fn is 'function'
          cb_start_fn()

        @__._loader_bar_sel.animate(
          width: '100%',
          300,
          'linear',

          ( ->
            self.__._loader_bar_sel.removeClass 'animated'

            # Hide progress bar?
            if self._options.auto_hide is true
              self.__._loader_bar_container_sel.stop true
              self.__._loader_bar_container_sel.fadeOut 400

            if typeof cb_finish_fn is 'function'
              cb_finish_fn()
          )
        )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._end_progress_bar', error
        )


    _get_error_alert: ->
      try
        return @_document_sel.find '.alerts .async-load-error'
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._get_error_alert', error
        )


    _show_error_alert: (seconds=10) ->
      try
        error_alert_sel = @_get_error_alert()

        error_alert_sel.stop(true).hide()
        error_alert_sel.animate(
          height: 'toggle', opacity: 'toggle',
          400,
          -> @_jQuery(this).oneTime(
            "#{seconds}s",
            -> @_jQuery(this).animate(
              height: 'toggle', opacity: 'toggle',
              400
            )
          )
        )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._show_error_alert', error
        )


    _hide_error_alert: ->
      try
        error_alert_visible_sel = @_get_error_alert().filter ':visible'

        if error_alert_visible_sel.size()
          error_alert_visible_sel.stopTime()
          error_alert_visible_sel.stop(true).animate(
            height: 'toggle', opacity: 'toggle',
            250
          )
      catch error
        @_options.console.error(
          'Progressio.ProgressioPage._hide_error_alert', error
        )


    _scroll_top: ->
      try
        @_window_sel.scrollTop 0
      catch error
        @_options.console.error 'Progressio.ProgressioPage._scroll_top', error


  class ProgressioRegistry
    constructor: (parent, options, deps) ->
      try
        # Configuration
        @__       = parent
        @_options = options
        @_jQuery  = deps.jquery

        # Variables
        @_registry_events = {}
        @_registry_bundles = []
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.constructor', error
        )


    events: ->
      try
        @_bind_events 'body'
      catch error
        @_options.console.error 'Progressio.ProgressioRegistry.events', error


    _bind_events: (parent) ->
      try
        parent = (parent or 'body')

        is_init = (parent is 'body')
        cur_registry = null

        for ns, cur_registry of @_registry_events
          try
            # Don't execute if we are in init mode + ignoring init
            if not (is_init and cur_registry[2])
              (cur_registry[0].bind cur_registry[1])(parent)

            @_options.console.debug(
              'Progressio.ProgressioRegistry._bind_events[loop]',
              "Bound callback function for #{ns}"
            )
          catch _error
            @_options.console.error(
              'Progressio.ProgressioRegistry._bind_events[loop]',
              "Registry callback function execution failed for " + \
              "#{ns} with error message: #{_error}"
            )
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry._bind_events', error
        )


    register_event: (namespace, fn_callback, fn_context, ignore_init) ->
      try
        ignore_init = false or ignore_init
        @_registry_events[namespace] = [fn_callback, fn_context, ignore_init]

        @_options.console.info(
          'Progressio.ProgressioRegistry.register_event',
          "Registered event: #{namespace}"
        )
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.register_event', error
        )


    unregister_event: (namespace) ->
      try
        if namespace in @_registry_events
          delete @_registry_events[namespace]

          @_options.console.info(
            'Progressio.ProgressioRegistry.unregister_event',
            "Unregistered event: #{namespace}"
          )

          return true

        return false
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.unregister_event', error
        )


    init_events: ->
      try
        @_bind_events 'body'
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.init_events', error
        )


    restore_events: (parent) ->
      try
        @_bind_events parent
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.restore_events', error
        )


    register_bundle: (bundle) ->
      try
        @_registry_bundles.push(bundle)
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.register_bundle', error
        )


    unload_bundles: ->
      try
        count_unload = 0

        for cur_bundle in @_registry_bundles
          if @hasOwnProperty(cur_bundle)
            # Delete bundle, loaded in the current window
            delete _[cur_bundle]
            count_unload++

        @_options.console.info(
          'Progressio.ProgressioRegistry.unload_bundles',
          "Unloaded #{count_unload} bundles"
        )
      catch error
        @_options.console.error(
          'Progressio.ProgressioRegistry.unload_bundles', error
        )


  class ProgressioMisc
    constructor: (parent, options, deps) ->
      try
        # Configuration
        @__       = parent
        @_options = options
        @_jQuery  = deps.jquery

        # Storage
        @_key_event = {}
      catch error
        @_options.console.error 'Progressio.ProgressioMisc.constructor', error


    key_event: ->
      try
        return @_key_event
      catch error
        @_options.console.error 'Progressio.ProgressioMisc.key_event', error


    split_selector_path: (selector_path) ->
      selector_path_arr =
        attr  : 'data-selector'
        value : null

      try
        selector_path_type = selector_path.substr(
          0, 1
        )

        selector_path_arr.value = selector_path.substr(
          1, selector_path.length
        )

        switch selector_path_type
          when '#'
            selector_path_arr.attr = 'id'
            break

          when '.'
            selector_path_arr.attr = 'class'
            break
      catch error
        @_options.console.error(
          'Progressio.ProgressioMisc.split_selector_path', error
        )
      finally
        return selector_path_arr
