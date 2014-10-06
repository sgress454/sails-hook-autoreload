# sails-hook-autoreload

[Sails JS](http://sailsjs.org) hook to autoreload controllers and models when changed.

### Installation

`npm install sails-hook-autoreload`

### Usage

Just lift your app as normal, and when you add / change / remove a model or controller file, *all* controllers and models will be reloaded without having to lower / relift the app.  This includes all blueprint routes.

### Configuration

By default, configuration lives in `sails.config.autoreload`.  The configuration key (`autoreload`) can be changed by setting `sails.config.hooks['sails-hook-autoreload'].configKey`.

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
active        | ((boolean)) | Whether or not the hook should watch for controller / model changes.  Defaults to `true`.

That&rsquo;s it!