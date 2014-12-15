var path = require('path');
module.exports = function(sails) {

  return {

    /**
     * Default configuration
     *
     * We do this in a function since the configuration key for
     * the hook is itself configurable, so we can't just return
     * an object.
     */
    defaults: {

      __configKey__: {
        // Set autoreload to be active by default
        active: true
      }
    },

    /**
     * Initialize the hook
     * @param  {Function} cb Callback for when we're done initializing
     */
    initialize: function(cb) {

      // If the hook has been deactivated, just return
      if (!sails.config[this.configKey].active) {
        sails.log.verbose("Autoreload hook deactivated.");
        return cb();
      }

      // Initialize the file watcher to watch controller and model dirs
      var chokidar = require('chokidar');

      // Watch both the controllers and models directories
      var watcher = chokidar.watch([
        path.resolve(sails.config.appPath,'api','controllers'),
        path.resolve(sails.config.appPath,'api','models')
      ], {
        // Ignore the initial "add" events which are generated when Chokidar
        // starts watching files
        ignoreInitial: true
      });

      // Whenever something changes in those dirs, reload the ORM, controllers and blueprints.
      // Debounce the event handler so that it only fires after receiving all of the change
      // events.
      watcher.on('all', sails.util.debounce(function(action, path, stats) {

        sails.log.verbose("Detected API change -- reloading controllers / models...");

        // Reload controller middleware
        sails.hooks.controllers.loadAndRegisterControllers(function() {

          // Wait for the ORM to reload
          sails.once('hook:orm:reloaded', function() {

            // Flush router
            sails.router.flush();

            // Reload blueprints
            sails.hooks.blueprints.bindShadowRoutes();

          });

          // Reload ORM
          sails.emit('hook:orm:reload');

        });

      }, 100));

      // We're done initializing.
      return cb();

    },

  };

};
