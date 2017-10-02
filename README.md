# :family: :family: :family: Community maintened package :family: :family: :family: 

The **sails-hook-autoreload** package is no longer maintained as an official Sails hook.  Use at your own risk.  If you are interested in continuing development on this hook, please contact [@sgress454](@sgress454).  
It is now maintained by sails lovers instead of the official sails team. 

*We are still actively maintaining [Sails](https://github.com/balderdashy/sails), and using it in all sorts of production-level apps.  We&rsquo;re just ending support for this hook.*

Thanks for using [Sails](https://github.com/balderdashy/sails)!

# sails-hook-autoreload

[Sails JS](http://sailsjs.org) hook to autoreload controllers, models, services and locales when changed.

This hook is to help with situations where you are rapidly prototyping/tinkering with app code and don't want to have to keep quitting/restarting Sails to see your changes.  It is not intended to be used in a production environment.  _It also may not work properly in conjunction with other Sails plugins, especially ones that operate on models or watch for file changes!_

##### Incompatible plugins

If your app uses a plugin that adds or modifies models, services, controllers or locales, `sails-hook-autoreload` is unlikely to work properly.  Here's an incomplete list of such plugins:

`sails-auto-admin`,` sails-auth`,` sails-auth-bugfix-zb`,` sails-auth-no-test`,` sails-hook-admin`,` sails-hook-confirmations`,` sails-magik-swagger`,` sails-passport-hook`,` sails-permissions`,` sails-permissions-sequelize`,` sails-swagger`,` sails-swagger-bk`,` sails-swagger-spec`,` sails-webpack`,` cision-sails-auth`,` cision-sails-permissions`,` nx-sails-swagger`,` vanuan-sails-swagger`, and any package that depends on `marlinspike`.

> Note: this is not a statement on the quality of the above packages.  They&rsquo;re simply incompatible with `sails-hook-autoreload`.

##### _Can't I just use [`forever`](https://github.com/foreverjs/forever) or [`nodemon`](https://github.com/remy/nodemon) or [insert daemon here] to do this_?

Yes, yes, you absolutely can, and if stability during development is your #1 concern, you absolutely should.  Nothing beats a cold reboot to get that oh-so-pristine app state.  The advantages of this hook are (1) it's faster, (2) it won't run your bootstrap every time (see #1), and (3) it won't drop your sessions / socket connections if you're using in-memory adapters during development.

### Installation

FOR SAILS v0.12.x:
`npm install sails-hook-autoreload@for-sails-0.12`

FOR SAILS 1.0:
`npm install sails-hook-autoreload`

### Usage
*requires at least sails >= 0.11*

Just lift your app as normal, and when you add / change / remove a model, controller or service file, *all* controllers, models, and services will be reloaded without having to lower / relift the app. This includes all blueprint routes.

> `sails-hook-autoreload` will, by default, use the `migrate: alter` strategy when reloading model files unless you explicitly set the `overrideMigrateSetting` config to `false`.  This allows you to change models without losing your development data when you have `migrate: drop` set.

### Configuration

By default, configuration lives in `sails.config.autoreload`.  The configuration key (`autoreload`) can be changed by setting `sails.config.hooks['sails-hook-autoreload'].configKey`.

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
active        | ((boolean)) | Whether or not the hook should watch for controller / model / service changes.  Defaults to `true`.
overrideMigrateSetting | ((boolean)) | Whether or not the hook should reload the app using the `alter` migrate setting, regardless of what is set in `sails.config.models.migrate`.  Defaults to `true`.  Note that this will have no effect on models with `migrate` settings of their own that override the global setting.
usePolling    | ((boolean)) | Whether or not to use the polling feature. Slower but necessary for certain environments. Defaults to `false`.
dirs          | ((array)) | Array of strings indicating which folders should be watched.  Defaults to the `api/models`, `api/controllers`, and `api/services` folders. Note that this won't change the set of files being reloaded, but the set of files being watched for changes. As for now, it's not possible to add new directories to be reloaded.
ignored       | ((array\|string\|regexp\|function)) |  Files and/or directories to be ignored. Pass a string to be directly matched, string with glob patterns, regular expression test, function that takes the testString as an argument and returns a truthy value if it should be matched, or an array of any number and mix of these types. For more examples look up [anymatch docs](https://github.com/es128/anymatch).

#### Example

```javascript
// [your-sails-app]/config/autoreload.js
module.exports.autoreload = {
  active: true,
  usePolling: false,
  dirs: [
    "api/models",
    "api/controllers",
    "api/services",
    "config/locales"
  ],
  ignored: [
    // Ignore all files with .ts extension
    "**.ts"
  ]
};

```

That&rsquo;s it!
