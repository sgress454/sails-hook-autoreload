// oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
// WARNING: THIS HOOK USES PRIVATE, UNDOCUMENTED APIs THAT COULD CHANGE AT ANY TIME
// oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
// This hook uses an undocumented, private Sails core method in order to reload controllers without 
// having to lower/re-lift an app. You should not copy or reuse that code (clearly marked below) in an 
// app, because future releases of Sails--even patch releases--may cause it to stop functioning.
// The private API usage used below will be replaced by a public method as soon as it is available.
// In the meantime, enjoy, and as stated in the README, do not turn this hook on in production!
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
        //use polling to watch file changes
        //slower but sometimes needed for VM environments
        usePolling: false,
        // Set dirs to watch
        dirs: [
          path.resolve(sails.config.appPath,'api','controllers'),
          path.resolve(sails.config.appPath,'api','models'),
          path.resolve(sails.config.appPath,'api','services'),
          path.resolve(sails.config.appPath,'config','locales')
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

      // If the hook has been deactivated, or controllers is deactivated just return
      if (!sails.config[this.configKey].active || !sails.hooks.controllers) {
        sails.log.verbose("Autoreload hook deactivated.");
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

      sails.log.verbose("Autoreload watching: ", sails.config[this.configKey].dirs);

      // Whenever something changes in those dirs, reload the ORM, controllers and blueprints.
      // Debounce the event handler so that it only fires after receiving all of the change
      // events.
      watcher.on('all', sails.util.debounce(function(action, path, stats) {

        sails.log.verbose("Detected API change -- reloading controllers / models...");

        // don't drop database
        sails.config.models.migrate = sails.config[self.configKey].overrideMigrateSetting ? 'alter' : sails.config.models.migrate;

        //                    \│/  ╦ ╦╔═╗╦═╗╔╗╔╦╔╗╔╔═╗  \│/                  
        //  ─────────────────── ─  ║║║╠═╣╠╦╝║║║║║║║║ ╦  ─ ───────────────────
        //                    /│\  ╚╩╝╩ ╩╩╚═╝╚╝╩╝╚╝╚═╝  /│\                  
        //  ┬ ┬┌┐┌┌┬┐┌─┐┌─┐┬ ┬┌┬┐┌─┐┌┐┌┌┬┐┌─┐┌┬┐  ┌─┐┌─┐┬┌─┐  ┬┌┐┌  ┬ ┬┌─┐┌─┐
        //  │ ││││ │││ ││  │ ││││├┤ │││ │ ├┤  ││  ├─┤├─┘│└─┐  ││││  │ │└─┐├┤ 
        //  └─┘┘└┘─┴┘└─┘└─┘└─┘┴ ┴└─┘┘└┘ ┴ └─┘─┴┘  ┴ ┴┴  ┴└─┘  ┴┘└┘  └─┘└─┘└─┘
        //  The loadAndRegisterControllers method is a _private_ method of the
        //  controllers hook, and should not be used in your app code.
        //  It will be replaced here as soon as a public "reload" method is added
        //  to the controllers hook.  But in the meantime it's okay because
        //  you're not using this in production, right?
        //  
        //  Reload controller middleware
        sails.hooks.controllers.loadAndRegisterControllers(function() {

          // Wait for the ORM to reload
          sails.once('hook:orm:reloaded', function() {

            // Reload locales
            sails.hooks.i18n.initialize(function() {});

            // Reload services
            sails.hooks.services.loadModules(function() {});

            // Reload blueprints on controllers
            sails.hooks.blueprints.extendControllerMiddleware();

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
