var path = require('path');
var _ = require('@sailshq/lodash');
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
        //use polling to watch file changes
        //slower but sometimes needed for VM environments
        usePolling: false,
        // Set dirs to watch
        dirs: [
          path.resolve(sails.config.appPath,'api','controllers'),
          path.resolve(sails.config.appPath,'api','models'),
          path.resolve(sails.config.appPath,'api','services'),
          path.resolve(sails.config.appPath,'api','helpers'),
          path.resolve(sails.config.appPath,'config','locales'),
          path.resolve(sails.config.appPath,'config','routes.js')
        ],
        overrideMigrateSetting: true,
        // Ignored paths, passed to anymatch
        // String to be directly matched, string with glob patterns,
        // regular expression test, function
        // or an array of any number and mix of these types
        ignored: []
      }
    },

    configure: function() {
      sails.config[this.configKey].active =
        // If an explicit value for the "active" config option is set, use it
        (typeof sails.config[this.configKey].active !== 'undefined') ?
          // Otherwise turn off in production environment, on for all others
          sails.config[this.configKey].active :
            (sails.config.environment != 'production');
    },

    /**
     * Initialize the hook
     * @param  {Function} cb Callback for when we're done initializing
     */
    initialize: function(cb) {

      var self = this;

      var routesConfigPath = path.resolve(sails.config.appPath,'config','routes.js');

      // If the hook has been deactivated, or controllers is deactivated just return
      if (!sails.config[this.configKey].active) {
        sails.log.verbose("sails-hook-autoreload: Autoreload hook deactivated.");
        return cb();
      }

      // Initialize the file watcher to watch controller and model dirs
      var chokidar = require('chokidar');

      // Watch both the controllers and models directories
      var watcher = chokidar.watch(sails.config[this.configKey].dirs, {
        // Ignore the initial "add" events which are generated when Chokidar
        // starts watching files
        ignoreInitial: true,
        usePolling: sails.config[this.configKey].usePolling,
        ignored: sails.config[this.configKey].ignored
      });

      sails.log.verbose("sails-hook-autoreload: Autoreload watching: ", sails.config[this.configKey].dirs);

      // Whenever something changes in those dirs, reload the ORM, controllers and blueprints.
      // Debounce the event handler so that it only fires after receiving all of the change
      // events.
      watcher.on('all', _.debounce(function(action, watchedPath, stats) {

        sails.log.verbose("sails-hook-autoreload: Detected API change -- reloading controllers / models...");

        // Don't use the configured migration strategy if `overrideMigrateSetting` is true.

        if(sails.config.models) {
          sails.config.models.migrate = sails.config[self.configKey].overrideMigrateSetting ? 'alter' : sails.config.models.migrate;
        }

        //  Reload controller middleware
        sails.reloadActions(function() {

          // Reload helpers
          sails.hooks.helpers.reload(function() {

            function reloadEveryElseThanOrm () {
                // Reload services
                if (sails.hooks.services) {
                  sails.hooks.services.loadModules(function() {});
                }

                // Unset all of the current routes from the `explicitRoutes` hash.
                // This hash may include some routes added by hooks, so can't just wipe
                // it entirely, but in case some route URLs changed we don't want
                // the old ones hanging around.
                sails.router.explicitRoutes = _.omit(sails.router.explicitRoutes, function(action, address) {
                  return !!sails.config.routes[address];
                });
                // Reload the config/routes.js file.
                try {
                  // Remove the routes config file from the require cache.
                  delete require.cache[require.resolve(routesConfigPath)];
                  sails.config.routes = require(routesConfigPath).routes;
                } catch (e) {
                  sails.log.verbose('sails-hook-autoreload: Could not reload `' + routesConfigPath + '`.');
                }

                // Flush the router.
                sails.config.routes = _.extend({}, sails.router.explicitRoutes, sails.config.routes);
                sails.router.flush(sails.config.routes);
            }

           if(sails.hooks.orm) {
             sails.hooks.orm.reload(function() {
               // Wait for the ORM to reload
               reloadEveryElseThanOrm();
             });
           }
           else {
             reloadEveryElseThanOrm();
           }

          });

        });

      }, 100));

      // We're done initializing.
      return cb();

    },

  };

};
