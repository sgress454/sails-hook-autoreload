// oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
// WARNING: THIS HOOK USES PRIVATE, UNDOCUMENTED APIs THAT COULD CHANGE AT ANY TIME
// oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
// This hook uses an undocumented, private Sails core method in order to reload controllers without
// having to lower/re-lift an app. You should not copy or reuse that code (clearly marked below) in an
// app, because future releases of Sails--even patch releases--may cause it to stop functioning.
// The private API usage used below will be replaced by a public method as soon as it is available.
// In the meantime, enjoy, and as stated in the README, do not turn this hook on in production!

var path = require('path');
var _ = require('lodash');

module.exports = function (sails) {
    return {
        configKey: 'autoreload',
        defaults: {
            __configKey__: {
                //use polling to watch file changes
                //slower but sometimes needed for VM environments
                usePolling: true,
                // No default dirs to watch
                dirs: [],
                overrideMigrateSetting: false,
                // Ignored paths, passed to anymatch
                // String to be directly matched, string with glob patterns,
                // regular expression test, function
                // or an array of any number and mix of these types
                ignored: []
            }
        },
        configure: function () {
            sails.config[this.configKey].active =
                    // If an explicit value for the "active" config option is set, use it
                    _.isBoolean(sails.config[this.configKey].active) ?
                    // Otherwise turn off in production environment, on for all others
                    sails.config[this.configKey].active :
                    (sails.config.environment !== 'production');
        },
        /**
         * Initialize the hook
         * @param  {Function} cb Callback for when we're done initializing
         */
        initialize: function (cb) {
            var self = this;

            var routesConfigPath = path.resolve(sails.config.appPath, 'config', 'routes.js');

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
            var watchedFiles = _.map(sails.config[this.configKey].dirs, function (item) {
                var parsed = path.parse(item.replace(/\\/g, '/'));
                return !parsed.ext ?
                        // If it's a folder, print "folder/**/*"
                        parsed.base + '/**/*'
                        // if it's a file, print "parent/file.ext"
                        : [_.last(parsed.dir.split('/')), parsed.base].join('/');
            });

            sails.log.info("Autoreload watching the following files: \n%s", watchedFiles.join('\n'));

            // Whenever something changes in those dirs, reload the ORM, controllers and blueprints.
            // Debounce the event handler so that it only fires after receiving all of the change
            // events.
            watcher.on('all', sails.util.debounce(function (action, path, stats) {

                sails.log.info("Detected API change -- reloading controllers / models...");
                sails.log.info("Changed file: %s", path);

                // don't drop database
                sails.config.models.migrate = !!sails.config[self.configKey].overrideMigrateSetting ? 'alter' : sails.config.models.migrate;

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
                sails.hooks.controllers.loadAndRegisterControllers(function () {

                    // Wait for the ORM to reload
                    sails.once('hook:orm:reloaded', function () {

                        // Reload locales
                        if (sails.hooks.i18n) {
                            sails.hooks.i18n.initialize(function () {});
                        }

                        // Reload services
                        if (sails.hooks.services) {
                            sails.hooks.services.loadModules(function () {});
                        }

                        // Reload blueprints on controllers
                        if (sails.hooks.blueprints) {
                            sails.hooks.blueprints.extendControllerMiddleware();
                        }

                        // Unset all of the current routes from the `explicitRoutes` hash.
                        // This hash may include some routes added by hooks, so can't just wipe
                        // it entirely, but in case some route URLs changed we don't want
                        // the old ones hanging around.
                        sails.router.explicitRoutes = _.omit(sails.router.explicitRoutes, function (action, address) {
                            return !!sails.config.routes[address];
                        });
                        // Reload the config/routes.js file.
                        try {
                            // Remove the routes config file from the require cache.
                            delete require.cache[require.resolve(routesConfigPath)];
                            sails.config.routes = require(routesConfigPath).routes;
                        } catch (e) {
                            sails.log.error('sails-hook-autoreload: Could not reload `' + routesConfigPath + '`.');
                        }

                        // Flush the router.
                        sails.config.routes = _.extend({}, sails.router.explicitRoutes, sails.config.routes);
                        sails.router.flush(sails.config.routes);

                        // Reload blueprints
                        if (sails.hooks.blueprints) {
                            sails.hooks.blueprints.bindShadowRoutes();
                        }

                    });

                    // Get every sails-postgresql connection name
                    var sailsPostgreConnections = _.reduce(sails.config.connections, function (result, val, key) {
                        (val.adapter === 'sails-postgresql') && result.push(key);
                        return result;
                    }, []);

                    // Tear each PostgreSQL connection down
                    _.forEach(sailsPostgreConnections, function (connection) {
                        sails.adapters['sails-postgresql'].teardown(connection, function () {
                            sails.log.info("DB connection '%s' teared down.", connection);
                        });
                    });

                    // Reload ORM
                    sails.emit('hook:orm:reload');

                });

            }, 100));

            // We're done initializing.
            return cb();
        }
    };
};