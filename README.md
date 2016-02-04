# sails-hook-autoreload

[Sails JS](http://sailsjs.org) hook to autoreload controllers, models, services and locales when changed.

This hook is to help with situations where you are rapidly prototyping/tinkering with app code and don't want to have to keep quitting/restarting Sails to see your changes.  It is not intended to be used in a production environment.

##### _Can't I just use [`forever`](https://github.com/foreverjs/forever) or [`nodemon`](https://github.com/remy/nodemon) or [insert daemon here] to do this_?

Yes, yes, you absolutely can, and if stability during development is your #1 concern, you absolutely should.  Nothing beats a cold reboot to get that oh-so-pristine app state.  The advantages of this hook are (1) it's faster, (2) it won't run your bootstrap every time (see #1), and (3) it won't drop your sessions / socket connections if you're using in-memory adapters during development.

### Installation

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
