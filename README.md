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

Also, be aware that this hook remembers the database migrate settings that you use when you lift your SailsJS server and will reuse it on every save. For example, if you were to use the migrate setting of 3 (drop database and rebuild the models) then your database will be dropped every time you save a file.

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
  ]
};

```

That&rsquo;s it!

