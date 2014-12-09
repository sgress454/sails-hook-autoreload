var path = require('path');
module.exports = function(sails) {

  var self = this;

  return {

    /**
     * Default configuration
     * @type {Object}
     */
    defaults: function() {
      var obj = {};
      self.configKey = (sails.config.hooks['sails-hook-autoreload'] && sails.config.hooks['sails-hook-autoreload'].configKey) || 'autoreload';
      obj[self.configKey] = {
        active: true
      };
      return obj;
    },

    initialize: function(cb) {

      // If the hook has been deactivated, just return
      if (!sails.config[self.configKey].active) {
        sails.log.verbose("Autoreload hook deactivated.");
        return cb();
      }

      // Initialize the file watcher to watch controller and model dirs
      var chokidar = require('chokidar');

      var dirs = [];

      var watcher = chokidar.watch([
        path.resolve(sails.config.appPath,'api','controllers'),
        path.resolve(sails.config.appPath,'api','models')
      ], {
        ignoreInitial: true
      });

      // Whenever something changes in those dirs, reload the ORM, controllers and blueprints
      watcher.on('all', sails.util.debounce(function(action, path, stats) {

        sails.log.verbose("Detected API change -- reloading controllers / models...");

        // Reload controller middleware
        sails.hooks.controllers.loadAndRegisterControllers(function() {

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

      return cb();

    },

  };

};
