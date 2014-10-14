Progressio
==========

Progressio transforms your static website to a dynamic environment. Pages are loaded asynchronously, with the use of browser history JavaScript API and a beautiful overlay progress bar.

This library was originally built for [Waaave](https://waaave.com/). You can see it live there.

Progressio is published under the terms of the Mozilla Public License v2.0 (MPL v2.0) license - see the LICENSE.md file.


## Demo

You can test our online demo of Progression there: https://demo.hakuma.holdings/valerian.saliou/progressio/examples/simple.html


## Installation Notes

### Dependencies

Progressio depends on the following libraries:

* [jQuery](https://github.com/jquery/jquery)
* [jQuery Timers](https://github.com/patryk/jquery.timers)
* [Console.js](https://github.com/valeriansaliou/console.js)

If you don't have them, you can build the library using the GruntJS `build:with_libs` task.

### Build

Progressio can be built using the GruntJS build system.

Execute the following command to build the library:

`grunt build`

Once done, you can retrieve the progressio.js and progressio.css files in the build/ folder.


## Usage

Using Progressio is straightforward. Here's how to use it.

### 1. Include library files

Load Progression source files and its dependencies in the head of your website pages. Please add it globally to your website (in your base template - provided you're using a template system).

```html
<!-- BEGIN Dependencies -->
<script src="./libs/javascripts/jquery.js" type="text/javascript" data-scope="common"></script>
<script src="./libs/javascripts/jquery.timers.js" type="text/javascript" data-scope="common"></script>
<script src="./libs/javascripts/console.js" type="text/javascript" data-scope="common"></script>
<!-- END Dependencies -->

<!-- BEGIN Progressio -->
<script src="./libs/javascripts/progressio.js" type="text/javascript" data-scope="common"></script>
<link rel="stylesheet" href="./libs/stylesheets/progressio.css" type="text/css" data-scope="common">
<!-- END Progressio -->
```


### 2. Initiliaze library configuration

TODO.

```javascript
// TODO
```


### 3. Tag links to be excluded

TODO.

```html
```


### 4. Tag common dependencies (stylesheets + scripts)

TODO.

```html
```
