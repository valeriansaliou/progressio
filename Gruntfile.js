/*
 * Progressio
 * Automated tasks (uses GruntJS)
 *
 * Copyright 2014, Valérian Saliou
 * URL: https://github.com/valeriansaliou/progressio
 * Author: Valérian Saliou https://valeriansaliou.name/
 */


module.exports = function(grunt) {

  // Map environment
  var ENV_PATHS = {
    assets: './build',
    libraries: './lib'
  };


  // Map tasks
  var GRUNT_TASKS = ['build', 'test', 'lint'];

  var GRUNT_TASKS_BUILD_COMMON = [
    'shell',
    'coffee',
    'compass',
    'concat',
    'copy'
  ];

  var GRUNT_TASKS_BUILD_SHIP = [
    'uglify',
    'cssmin'
  ];

  var GRUNT_TASKS_BUILD_BANNER = {
    main: [
      'usebanner:dev_javascripts_uncompressed',
      'usebanner:dev_stylesheets_uncompressed'
    ],

    test: [],

    demo: [
      'usebanner:ship_javascripts_compressed',
      'usebanner:ship_stylesheets_compressed'
    ],

    release: [
      'usebanner:ship_javascripts_uncompressed',
      'usebanner:ship_stylesheets_uncompressed',
      'usebanner:ship_javascripts_compressed',
      'usebanner:ship_stylesheets_compressed'
    ]
  };

  var GRUNT_TASKS_BUILD = {
    main: ['clean:build'].concat(
      ['bower:install'],
      GRUNT_TASKS_BUILD_COMMON,
      GRUNT_TASKS_BUILD_BANNER.main,
      GRUNT_TASKS_BUILD_SHIP,
      ['clean:temporary']
    ),

    dev: ['clean:build'].concat(
      ['bower:install'],
      GRUNT_TASKS_BUILD_COMMON,
      ['clean:temporary']
    ),

    test: ['clean:build'].concat(
      ['bower:install'],
      GRUNT_TASKS_BUILD_COMMON,
      GRUNT_TASKS_BUILD_BANNER.test,
      ['clean:temporary']
    )
  };

  var GRUNT_TASKS_WATCH = {
    javascripts: ['coffee', 'concat', 'copy:javascripts'],
    stylesheets: ['compass', 'copy:stylesheets'],
    images: ['compass', 'copy:stylesheets']
  };

  var GRUNT_TASKS_TEST = {
    main: ['build:test', 'lint']
  };

  var GRUNT_TASKS_LINT = {
    js: ['jshint'],
    css: ['csslint']
  };


  // Map files
  var GRUNT_BASE_FILES = [
    'progressio'
  ];

  var GRUNT_DEPENDENCY_FILES = [];

  var GRUNT_LIBRARY_FILES = [
    ENV_PATHS.libraries + '/jquery/jquery.js',
    ENV_PATHS.libraries + '/jquery.timers/jquery.timers.js',
    ENV_PATHS.libraries + '/jquery.hasparent/jquery.hasparent.js',
    ENV_PATHS.libraries + '/jquery.ui/dist/jquery-ui.js',
    ENV_PATHS.libraries + '/lazyload/lazyload.js',
    ENV_PATHS.libraries + '/console/console.js',
  ];

  var GRUNT_LIBRARY_PREPROCESSED_FILES = [
    'libs'
  ];

  var GRUNT_SOURCE_FILES = {
    css: GRUNT_BASE_FILES,
    js: GRUNT_BASE_FILES
  };

  var GRUNT_REPLACE_FILES = [
    {
      src: 'tmp/javascripts/progressio.js',
      dest: 'tmp/javascripts/progressio.js'
    }
  ];

  var GRUNT_LINT_FILES = {
    js: ['Gruntfile.js', /* ENV_PATHS.assets + '/javascripts/*.js' */],
    css: [ENV_PATHS.assets + '/stylesheets/*.css']
  };


  // Map functions
  var fn_generate_banner_options = function(type, state) {
    return {
      position: 'top',
      banner: fn_generate_banner(type, state),
      linebreak: false
    };
  };

  var fn_generate_banner = function(type, state) {
    var is_template = (type === 'templates') && true;
    var opts = {
      open  : (is_template && '<!--' || '/**'),
      line  : (is_template && ' ' || ' * '),
      close : (is_template && '-->' || '*/'),
    };

    return opts.open +
            '\n' +
           opts.line +
            '<%= pkg.name %> [' + state + ']\n' +
           opts.line +
            '@fileoverview <%= pkg.description %>\n' +
           opts.line +
            '\n' +
           opts.line +
            '@version <%= pkg.version %>\n' +
           opts.line +
            '@date <%= grunt.template.today("yyyy-mm-dd") %>\n' +
           opts.line +
            '@author <%= pkg.author.name %> <%= pkg.author.url %>\n' +
           opts.line +
            '@license <%= pkg.license %>\n' +
           opts.line +
            '\n' +
           opts.line +
            '@url <%= pkg.homepage %>\n' +
           opts.line +
            '@repository <%= pkg.repository.type %>+<%= pkg.repository.url %>' +
            '\n' +
           opts.close +
            '\n\n';
  };

  var fn_generate_files = function(array, base, type, extension, suffix, sub) {
    var files = [],
        type_l;

    // Append locales?
    if(sub === 'locales' && ENV_LOCALES.length) {
      for(var l in ENV_LOCALES) {
        type_l = (type + '/' + ENV_LOCALES[l]);

        files = files.concat(
          fn_generate_files(array, base, type_l, extension, suffix)
        );
      }
    } else {
      for(var i in array) {
        files.push(
          './' + base + '/' + type + '/' +
          array[i] + (suffix && ('.' + suffix) || '') + '.' + extension
        );
      }
    }

    return files;
  };

  var fn_generate_files_rename = function(array, type, extension, target, sub) {
    var files_rename = [];

    var files_copy_source = fn_generate_files(
      array,
      'build',
      type,
      extension,
      (target === 'compressed' ? 'min' : null),
      sub
    );

    var files_copy_destination = fn_generate_files(
      array,
      'build',
      type,
      extension,
      (target === 'uncompressed' ? 'uncompressed' : null),
      sub
    );

    for(var i = 0; i < files_copy_source.length; i++) {
      files_rename.push({
        src: files_copy_source[i],
        dest: files_copy_destination[i],
      });
    }

    return files_rename;
  };

  var fn_generate_map = function(keys, values) {
    var map = {};

    for(var i = 0; i < keys.length; i++) {
      map[keys[i]] = values[i];
    }

    return map;
  };

  var fn_generate_task = function(tasks_obj, t) {
    var tasks_map = [];

    if(!t) {
      if(typeof tasks_obj.main == 'object') {
        tasks_map.push('main');
      } else {
        for(t in tasks_obj) {
          tasks_map.push(t);
        }
      }
    } else if(typeof tasks_obj[t] != 'object') {
      return grunt.warn('Invalid lint target name.\n');
    } else {
      tasks_map.push(t);
    }

    for(var c in tasks_map) {
      t = tasks_map[c];

      for(var i in tasks_obj[t]) {
        grunt.task.run(tasks_obj[t][i]);
      }
    }
  };


  // Map configurations

  var CONF_COMPASS_OPTIONS = {
    imagesDir: 'src/images',
    generatedImagesDir: 'build/images',
    httpGeneratedImagesPath: '../images',
    sassDir: 'src/stylesheets',
    cssDir: 'tmp/stylesheets',
    fontsDir: 'src/fonts',
    httpFontsPath: '../fonts',
    httpFontsDir: 'build/fonts',
    environment: 'development'
  };

  var CONF_COPY_FILES = {
    javascripts: {
      expand: true,
      cwd: 'tmp/',
      src: ['javascripts/**', '!javascripts/_*.js'],
      dest: ENV_PATHS.assets
    },

    stylesheets: {
      expand: true,
      cwd: 'tmp/',
      src: ['stylesheets/**'],
      dest: ENV_PATHS.assets
    }
  };

  var CONF_COFFEE_FILES = {
    expand: true,
    flatten: true,

    src: fn_generate_files(
      GRUNT_SOURCE_FILES.js.concat(GRUNT_DEPENDENCY_FILES),
      'src',
      'javascripts',
      'coffee'
    ),

    dest: 'tmp/javascripts/',
    ext: '.js'
  };

  var CONF_SASS_FILES = {
    src: fn_generate_files(
      GRUNT_SOURCE_FILES.css,
      'src',
      'stylesheets',
      'sass'
    ),
    dest: 'tmp/stylesheets',
    ext: '.css'
  };

  var CONF_BANNER_FILES = {
    dev_javascripts_uncompressed: fn_generate_files(
      GRUNT_SOURCE_FILES.js.concat(
        GRUNT_DEPENDENCY_FILES,
        GRUNT_LIBRARY_PREPROCESSED_FILES
      ),
      'build',
      'javascripts',
      'js'
    ),

    dev_stylesheets_uncompressed: fn_generate_files(
      GRUNT_SOURCE_FILES.css,
      'build',
      'stylesheets',
      'css'
    ),

    ship_javascripts_uncompressed: fn_generate_files(
      GRUNT_SOURCE_FILES.js.concat(GRUNT_LIBRARY_PREPROCESSED_FILES),
      'build',
      'javascripts',
      'js',
      'uncompressed'
    ),

    ship_javascripts_compressed: fn_generate_files(
      GRUNT_SOURCE_FILES.js.concat(GRUNT_LIBRARY_PREPROCESSED_FILES),
      'build',
      'javascripts',
      'js'
    ),

    ship_stylesheets_uncompressed: fn_generate_files(
      GRUNT_SOURCE_FILES.css,
      'build',
      'stylesheets',
      'css',
      'uncompressed'
    ),

    ship_stylesheets_compressed: fn_generate_files(
      GRUNT_SOURCE_FILES.css,
      'build',
      'stylesheets',
      'css'
    )
  };

  var CONF_CSSMIN_FILES = {
    expand: true,
    cwd: ENV_PATHS.assets + '/stylesheets/',
    src: ['*.css', '!*.min.css'],
    dest: ENV_PATHS.assets + '/stylesheets/',
    ext: '.min.css'
  };

  var CONF_UGLIFY_FILES = {
    expand: true,
    cwd: ENV_PATHS.assets + '/javascripts/',
    src: ['*.js', '!*.min.js'],
    dest: ENV_PATHS.assets + '/javascripts/',
    ext: '.min.js'
  };


  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    // Task: Bower
    bower: {
      install: {
        options: {
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: false,
          bowerOptions: {}
        }
      }
    },


    // Task: CoffeeScript
    coffee: {
      files: CONF_COFFEE_FILES
    },


    // Task: Compass
    compass: {
      options: CONF_COMPASS_OPTIONS,

      compile: {
        files: CONF_SASS_FILES
      }
    },


    // Task: JSHint
    jshint: {
      files: GRUNT_LINT_FILES.js
    },


    // Task: CSSLint
    csslint: {
      all: {
        options: {
          /*
           * CSS Lint Options
           * Reference: http://bit.ly/VSmkOt
           */

          'important': false,
          'duplicate-background-images': false,
          'star-property-hack': false,
          'adjoining-classes': false,
          'box-model': false,
          'qualified-headings': false,
          'unique-headings': false,
          'floats': false,
          'font-sizes': false,
          'ids': false,
          'universal-selector': false,
          'compatible-vendor-prefixes': false,
          'gradients': false,
          'overqualified-elements': false,
          'bulletproof-font-face': false
        },

        src: GRUNT_LINT_FILES.css
      }
    },


    // Task: Watch
    watch: {
      options: {
        interval: 100
      },

      javascripts: {
        files: 'src/javascripts/**.coffee',
        tasks: GRUNT_TASKS_WATCH.javascripts
      },

      stylesheets: {
        files: 'src/stylesheets/**.sass',
        tasks: GRUNT_TASKS_WATCH.stylesheets
      },

      images: {
        files: 'src/images/**',
        tasks: GRUNT_TASKS_WATCH.images
      }
    },


    // Task: Clean
    clean: {
      temporary: ['tmp/'],
      build: ['tmp/', 'build/*'],
      demo: ['tmp/', 'build/**/*.uncompressed.*'],
      reset: ['tmp/', 'lib/*', 'build/*', 'bower_components/']
    },


    // Task: Concat
    concat: {
      libs: {
        files: [{
          src: GRUNT_LIBRARY_FILES,
          dest: 'tmp/javascripts/libs.js',
        }]
      }
    },


    // Task: Copy
    copy: {
      javascripts: {
        files: [CONF_COPY_FILES.javascripts]
      },

      stylesheets: {
        files: [CONF_COPY_FILES.stylesheets]
      }
    },


    // Task: Shell
    shell: {
      make_jqueryui: {
        options: {
          stderr: false
        },

        command: ('cd ' + ENV_PATHS.libraries + '/jquery.ui && npm install && grunt concat')
      }
    },


    // Task: Banner
    usebanner: {
      dev_javascripts_uncompressed: {
        options: fn_generate_banner_options('javascripts', 'uncompressed'),

        files: {
          src: CONF_BANNER_FILES.dev_javascripts_uncompressed
        }
      },

      dev_stylesheets_uncompressed: {
        options: fn_generate_banner_options('stylesheets', 'uncompressed'),

        files: {
          src: CONF_BANNER_FILES.dev_stylesheets_uncompressed
        }
      },

      ship_javascripts_uncompressed: {
        options: fn_generate_banner_options('javascripts', 'uncompressed'),

        files: {
          src: CONF_BANNER_FILES.ship_javascripts_uncompressed
        }
      },

      ship_javascripts_compressed: {
        options: fn_generate_banner_options('javascripts', 'compressed'),

        files: {
          src: CONF_BANNER_FILES.ship_javascripts_compressed
        }
      },

      ship_stylesheets_uncompressed: {
        options: fn_generate_banner_options('stylesheets', 'uncompressed'),

        files: {
          src: CONF_BANNER_FILES.ship_stylesheets_uncompressed
        }
      },

      ship_stylesheets_compressed: {
        options: fn_generate_banner_options('stylesheets', 'compressed'),

        files: {
          src: CONF_BANNER_FILES.ship_stylesheets_compressed
        }
      }
    },


    // Task: CSSMin
    cssmin: {
      options: {
        report: 'min'
      },

      all: CONF_CSSMIN_FILES
    },


    // Task: Uglify
    uglify: {
      options: {
        report: 'min'
      },

      all: CONF_UGLIFY_FILES
    }
  });


  // Load plugins
  grunt.loadNpmTasks('grunt-bower-installer');

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-csslint');

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Register tasks
  grunt.registerTask('default', function() {
    var warn_str = '\n\n' + 'Usage:' + '\n';

    for(var i in GRUNT_TASKS) {
      warn_str += ' >> ' + GRUNT_TASKS[i] + ' - grunt ' + GRUNT_TASKS[i] + '\n';
    }

    warn_str += '\n';

    return grunt.warn(warn_str);
  });

  grunt.registerTask('build', function(t) {
    fn_generate_task(GRUNT_TASKS_BUILD, t);
  });

  grunt.registerTask('test', function() {
    fn_generate_task(GRUNT_TASKS_TEST);
  });

  grunt.registerTask('lint', function(t) {
    fn_generate_task(GRUNT_TASKS_LINT, t);
  });

};
