###
Progressio

URL: https://github.com/valeriansaliou/progressio
Author: Valérian Saliou
Copyright: 2014, Valérian Saliou
###

__ = window



class ProgressioPage
  init: ->
    try
      # Selectors
      @_window_sel = $ window
      @_document_sel = $ document
      @_head = $ 'head'
      @_header_sel = $ 'header.headers'
      @_bluelines_sel = @_header_sel.find '.bluelines'

      # States
      @_id_async = 0

      # Variables
      @_is_async_compatible = (window.history and history.pushState and true)
      @_http_protocol = document.location.protocol.replace ':', ''
      @_http_host = document.location.host
      @_state_url = document.location.pathname
    catch error
      Console.error 'ProgressioPage.init', error


  register: ->
    try
      __.ProgressioRegistry.register_event(
        'page:events_state_change', @events_state_change, @
      )

      __.ProgressioRegistry.register_event(
        'page:async_load', @events_async_load, @
      )
    catch error
      Console.error 'ProgressioPage.register', error


  purge_global_events: ->
    try
      @_window_sel.off()
      @_document_sel.off()
    catch error
      Console.error 'ProgressioPage.purge_global_events', error


  open_page: (url) ->
    try
      if @_is_async_compatible
        @_run_async_load url
      else
        document.location.href = url
    catch error
      Console.error 'ProgressioPage.open_page', error


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
            if __.ProgressioMisc.key_event().ctrlKey or \
               __.ProgressioMisc.key_event().metaKey
              return_value = true
            else
              self._run_async_load ($(this).attr 'href')
          catch _error
            Console.error 'ProgressioPage.events_async_load[async]', _error
          finally
            return return_value

        # Lock down further async load events on those links...
        eligible_links.attr 'data-progressio-async', 'active'

        if eligible_links_count
          Console.debug(
            'ProgressioPage.events_async_load',
            "Yay! #{eligible_links_count} internal links ajax-ified."
          )
      else
        Console.error(
          'ProgressioPage.events_async_load',
          'Woops, your browser is not compatible with asynchronous page load!'
        )
    catch error
      Console.error 'ProgressioPage.events_async_load', error


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
      Console.error 'ProgressioPage.events_state_change', error


  fire_dom_updated: ->
    try
      @events_async_load 'body'
    catch error
      Console.error 'ProgressioPage.fire_dom_updated', error


  get_id: ->
    try
      return @_id_async
    catch error
      Console.error 'ProgressioPage.get_id', error


  _eligible_links_async_load: ->
    try
      http_base = "#{@_http_protocol}://#{@_http_host}/"
      r_match = new RegExp "^(#{http_base}|(/(?!https?://).*))", 'gi'

      return @_document_sel.find(
        'a[href]:not([target="_blank"], ' +\
        '[data-progressio-async="disabled"], ' +\
        '[data-progressio-async="active"])'
      ).filter ->
        return $(this).attr('href').match r_match
    catch error
      Console.error 'ProgressioPage._eligible_links_async_load', error


  _run_async_load: (url) ->
    try
      self = @

      @_begin_progress_bar()
      @_hide_error_alert()

      id = ++@_id_async

      req_cb = (data) ->
        self._handle_async_load id, url, data

      $.ajax(
        url: url
        headers:
          'X-Requested-With': 'async_page_loader'
        type: 'GET'
        success: req_cb
        error: req_cb
      )

      Console.debug 'ProgressioPage._run_async_load', "Loading page: #{url}"
    catch error
      Console.error 'ProgressioPage._run_async_load', error


  _handle_async_load: (id, url, data) ->
    try
      self = @

      # Typical of a non-200 HTTP response (error response)
      if typeof data is 'object' and data.hasOwnProperty 'responseText'
        data = data.responseText

      if id is @_id_async
        data_sel = $ data
        new_dom = data_sel.filter '#body:first'

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

            Console.debug(
              'ProgressioPage._handle_async_load',
              "Done cleanup of old DOM before page: #{url}"
            )

          cb_post_display_fn = ->
            # Finish load, happily! :)
            self._end_progress_bar()
            self._scroll_top()

            # Reset other layout bundles
            self._document_sel.oneTime(
              250,
              -> __.LayoutComment.reset_last_hash()
            )

            Console.debug(
              'ProgressioPage._handle_async_load',
              "Done post display actions for page: #{url}"
            )

          cb_complete_fn = ->
            # Wait a little bit (DOM rendering lag and other joys!)
            self._document_sel.oneTime(
              250,
              ->
                # Cleanup DOM
                cb_cleanup_fn()

                self._document_sel.find('title').replaceWith title
                self._document_sel.find('#body').remove()
                self._document_sel.find('#body_new').attr('id', 'body').show()

                # Restore DOM events
                __.ProgressioRegistry.restore_events(
                  '#body'
                )

                # All done, now pushing to the history
                if url isnt self._state_url
                  self._state_url = url
                  history.pushState null, title, url

                # Trigger post-display events
                cb_post_display_fn()

                Console.debug(
                  'ProgressioPage._handle_async_load', "Loaded page: #{url}"
                )
            )

          # Purge old environment
          @purge_global_events()
          __.ProgressioRegistry.unload_bundles()

          # Append new DOM (in a temporary-hidden fashion)
          @_document_sel.find('#body_new').remove()

          new_dom.attr 'id', 'body_new'
          new_dom.hide()
          new_dom.insertBefore(
            @_document_sel.find '#body'
          )

          # Items to be appended directly
          @_head.append(
            data_sel.filter 'script:not([src]):not([data-progressio-scope="common"])'
          )

          @_head.append(
            data_sel.filter(
              'link[rel="stylesheet"]:not([href]):not([data-progressio-scope="common"])'
            )
          )

          # Items to load
          load_list =
            js: [],
            css: []

          data_sel.filter('script[src]:not([data-progressio-scope="common"])').each ->
            script_src = $(this).attr 'src'

            if script_src
              load_list.js.push script_src

          data_sel.filter(
            'link[href][rel="stylesheet"]:not([data-progressio-scope="common"])'
          ).each ->
            stylesheet_href = $(this).attr 'href'

            if stylesheet_href
              load_list.css.push stylesheet_href

          if load_list.js.length or load_list.css.length
            # Load new deps (finish page load once done)
            if load_list.js.length
              callback_counter++

              Console.info(
                'ProgressioPage._handle_async_load', 'Loading scripts...'
              )

              LazyLoad.js(
                load_list.js,
                ->
                  Console.info(
                    'ProgressioPage._handle_async_load[async]',
                    'Scripts fully loaded'
                  )

                  if --callback_counter is 0
                    cb_complete_fn()
              )

            if load_list.css.length
              callback_counter++

              Console.info(
                'ProgressioPage._handle_async_load', 'Loading stylesheets...'
              )

              LazyLoad.css(
                load_list.css,
                ->
                  Console.info(
                    'ProgressioPage._handle_async_load[async]',
                    'Stylesheets fully loaded'
                  )

                  if --callback_counter is 0
                    cb_complete_fn()
              )

            Console.debug(
              'ProgressioPage._handle_async_load',
              "Delayed page load (waiting for sources to be loaded): #{url}"
            )
          else
            cb_complete_fn()
        else
          @_show_error_alert(10)
          @_end_progress_bar()

          Console.error(
            'ProgressioPage._handle_async_load',
            "Got an abnormal or error response from: #{url}"
          )
      else
        Console.warn(
          'ProgressioPage._handle_async_load',
          "Dropped outpaced ID for page: #{url}"
        )
    catch error
      Console.error 'ProgressioPage._handle_async_load', error


  _begin_progress_bar: ->
    try
      # Reset progress bar
      @_bluelines_sel.stop true
      @_bluelines_sel.css
        width: 0

      # Animate progress bar!
      @_bluelines_sel.addClass 'animated'
      @_bluelines_sel.animate(
        width: '50%',
        600,
        'easeOutQuad'
      )
    catch error
      Console.error 'ProgressioPage._begin_progress_bar', error


  _end_progress_bar: ->
    try
      self = @

      # Animate progress bar!
      @_bluelines_sel.animate(
        width: '100%',
        300,
        'linear',
        -> self._bluelines_sel.removeClass 'animated'
      )
    catch error
      Console.error 'ProgressioPage._end_progress_bar', error


  _get_error_alert: ->
    try
      return @_document_sel.find '.alerts .async-load-error'
    catch error
      Console.error 'ProgressioPage._get_error_alert', error


  _show_error_alert: (seconds=10) ->
    try
      error_alert_sel = @_get_error_alert()

      error_alert_sel.stop(true).hide()
      error_alert_sel.animate(
        height: 'toggle', opacity: 'toggle',
        400,
        -> $(this).oneTime(
          "#{seconds}s",
          -> $(this).animate(
            height: 'toggle', opacity: 'toggle',
            400
          )
        )
      )
    catch error
      Console.error 'ProgressioPage._show_error_alert', error


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
      Console.error 'ProgressioPage._hide_error_alert', error


  _scroll_top: ->
    try
      # Hack: do not interfere w/ other scroll events
      good_to_go = not __.LayoutComment.get_hash_id() and true

      if good_to_go
        @_window_sel.scrollTop 0
    catch error
      Console.error 'ProgressioPage._scroll_top', error


class ProgressioRegistry
  init: ->
    try
      # Variables
      @_registry_events = {}
      @_registry_bundles = []
    catch error
      Console.error 'ProgressioRegistry.init', error


  events: ->
    try
      @_bind_events 'body'
    catch error
      Console.error 'ProgressioRegistry.events', error


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

          Console.debug(
            'ProgressioRegistry._bind_events[loop]',
            "Bound callback function for #{ns}"
          )
        catch _error
          Console.error(
            'ProgressioRegistry._bind_events[loop]',
            "Registry callback function execution failed for " + \
            "#{ns} with error message: #{_error}"
          )
    catch error
      Console.error 'ProgressioRegistry._bind_events', error


  register_event: (namespace, fn_callback, fn_context, ignore_init) ->
    try
      ignore_init = false or ignore_init
      @_registry_events[namespace] = [fn_callback, fn_context, ignore_init]

      Console.info(
        'ProgressioRegistry.register_event', "Registered event: #{namespace}"
      )
    catch error
      Console.error 'ProgressioRegistry.register_event', error


  unregister_event: (namespace) ->
    try
      if namespace in @_registry_events
        delete @_registry_events[namespace]

        Console.info(
          'ProgressioRegistry.unregister_event',
          "Unregistered event: #{namespace}"
        )

        return true

      return false
    catch error
      Console.error 'ProgressioRegistry.unregister_event', error


  init_events: ->
    try
      @_bind_events 'body'
    catch error
      Console.error 'ProgressioRegistry.init_events', error


  restore_events: (parent) ->
    try
      @_bind_events parent
    catch error
      Console.error 'ProgressioRegistry.restore_events', error


  register_bundle: (bundle) ->
    try
      @_registry_bundles.push(bundle)
    catch error
      Console.error 'ProgressioRegistry.register_bundle', error


  unload_bundles: ->
    try
      count_unload = 0

      for cur_bundle in @_registry_bundles
        if __.hasOwnProperty(cur_bundle)
          # Delete bundle, loaded in the current window
          delete _[cur_bundle]
          count_unload++

      Console.info(
        'ProgressioRegistry.unload_bundles', "Unloaded #{count_unload} bundles"
      )
    catch error
      Console.error 'ProgressioRegistry.unload_bundles', error


class ProgressioMisc
  init: ->
    try
      # Selectors
      @_window = $ window

      @_key_event = {}
    catch error
      Console.error 'ProgressioMisc.init', error


  key_event: ->
    try
      return @_key_event
    catch error
      Console.error 'ProgressioMisc.key_event', error
