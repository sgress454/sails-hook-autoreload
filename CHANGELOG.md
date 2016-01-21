# sails-hook-autoreload changelog

### 0.13.0

* [ENHANCEMENT] Auto-reload locales [#40](https://github.com/sgress454/sails-hook-autoreload/pull/40)
* [ENHANCEMENT] Added "overrideMigrateSetting" (defaults to `true`).  Set to `false` to use your app's configured migrate strategy upon reload, instead of having it overridden to `alter`.

### 0.12.0

* [ENHANCEMENT] Always use "alter" migrate strategy so that changes to models take effect immediately
* [ENHANCEMENT] Added reloading of blueprint ("shadow") routes [#31](https://github.com/sgress454/sails-hook-autoreload/pull/31)
* [ENHANCEMENT] Added "ignore" feature to allow ignoring paths [#32](https://github.com/sgress454/sails-hook-autoreload/pull/10)
* [UPGRADE] Use stable Chokidar dependency (^1.0.0)

### 0.11.5

* [ENHANCEMENT] Add watching / reloading of services [#10](https://github.com/sgress454/sails-hook-autoreload/pull/10)

### 0.11.4 

* [ENHANCEMENT] Allow watched dirs to be configurable 
* [ENHANCEMENT] Added polling option [#7](https://github.com/sgress454/sails-hook-autoreload/pull/7)
* [UPGRADE] Bump Chokidar dependency to ^1.0.0-rc3

### 0.11.3 (version skipped)

### 0.11.2

* [UPDATE] Use newer hook API features internally (e.g. __configKey__)

### 0.11.1

* Initial version

