Progressio
==========

Progressio transforms your static website to a dynamic environment. Pages are loaded asynchronously, with the use of browser history JavaScript API and a beautiful overlay progress bar.

This library was originally built for [Waaave](https://waaave.com/). You can see it live there.

Progressio is published under the terms of the Mozilla Public License v2.0 (MPL v2.0) license - see the LICENSE.md file.

[![build status](https://ci.hakuma.holdings/projects/57/status.png?ref=master)](https://ci.hakuma.holdings/projects/57?ref=master)


## Demo

You can test our online demo of Progression there: https://demo.hakuma.holdings/valerian.saliou/progressio/examples/simple.html


## Installation Notes

### Dependencies

Progressio depends on the following libraries:

* [jQuery](https://github.com/jquery/jquery)
* [jQuery Timers](https://github.com/patryk/jquery.timers)
* [Console.js](https://github.com/valeriansaliou/console.js)

### Build

Progressio can be built using the GruntJS build system.

Execute one of the following commands to build the library:

* Without libraries (recommended): `grunt build`
* Include libraries: `build:with_libs`

Once done, you can retrieve the progressio.js and progressio.css files in the build/ folder.


## Usage

Using Progressio is straightforward. Here's how to use it.

### 1. Include library files

Load Progression source files and its dependencies in the head of your website pages. Please add it globally to your website (in your base template - provided you're using a template system).

```html
<!-- BEGIN Dependencies -->
<script src="./libs/javascripts/jquery.js" type="text/javascript" data-progressio-scope="common"></script>
<script src="./libs/javascripts/jquery.timers.js" type="text/javascript" data-progressio-scope="common"></script>
<script src="./libs/javascripts/console.js" type="text/javascript" data-progressio-scope="common"></script>
<!-- END Dependencies -->

<!-- BEGIN Progressio -->
<script src="./libs/javascripts/progressio.js" type="text/javascript" data-progressio-scope="common"></script>
<link rel="stylesheet" href="./libs/stylesheets/progressio.css" type="text/css" data-progressio-scope="common">
<!-- END Progressio -->
```


### 2. Initiliaze library configuration

Progressio needs to be initialized in order to apply its change.

Once the library is loaded (on document ready, typically), execute the following snippet:

```javascript
Progressio.init({
  /* {blue|red|green|yellow|orange|black|purple|(custom)} */
  color: 'blue'
});
```

**Note: Progressio is configurable, refer to the comments above each line for available values.**


### 3. Tag links to be excluded

By default, Progressio patches all local links (links with the same domain and protocol as the current page being browsed + relative and absolute links without the host part).

If, for any reason, you want a link not to be patched, add the `data-progressio-async="disabled"` tag to the link element, as below:

```html
<a href="/path/to/other/page/" data-progressio-async="disabled">Path To Other Page</a>
```

**Note: links with `target="_blank"` are not patched, in any case.**


### 4. Tag common dependencies (stylesheets + scripts)

Progressio automatically process a diff of the page head dependencies while browsing.

It automatically includes and load new CSS stylesheets and JS scripts. If your website has site-wide/common dependencies, you may want to add a tag to let Progressio know it shouldn't replace it.

Set its Progressio scope to "common" by adding the `data-progressio-scope="common"` tag to the script/link element, as below:

```html
<!-- This script WON'T BE replaced -->
<script src="/not/to/replace.js" type="text/javascript" data-progressio-scope="common"></script>

<!-- This stylesheet WON'T BE replaced -->
<link rel="stylesheet" href="/not/to/replace.css" type="text/css" data-progressio-scope="common">

<!-- This stylesheet WILL BE replaced -->
<link rel="stylesheet" href="/can/be/replaced.css" type="text/css">
```
