# sails-hook-autoreload

[Sails JS](http://sailsjs.org) hook to autoreload controllers and models when changed.

### Installation

`npm install sails-hook-autoreload`

### Usage
*requires at least sails >= 0.11*

Just lift your app as normal, and when you add / change / remove a model, controller or service file, *all* controllers, models, and services will be reloaded without having to lower / relift the app. This includes all blueprint routes.


### Configuration

By default, configuration lives in `sails.config.autoreload`.  The configuration key (`autoreload`) can be changed by setting `sails.config.hooks['sails-hook-autoreload'].configKey`.

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
active        | ((boolean)) | Whether or not the hook should watch for controller / model / service changes.  Defaults to `true`.
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
    "api/services"
  ],
  ignored: [
    // Ignore all files with .ts extension
    "**.ts"
  ]
};

```

That&rsquo;s it!
