# Changelog Addons for Masterportal
 All important changes in this project are stored in this file.

[Semantic versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### __Breaking Changes__

### Added

### Changed

### Deprecated

### Removed

### Fixed

---
## v2.31.0 - 2023-03-01
### __Breaking Changes__
Time library `moment.js` was replaced with [day.js](https://day.js.org/). Please consider to use `day.js` in your future pull requests.

### Added
- In refugeeHomes a new layer with ukrainian refugee homes was added.

### Changed
- In schoolRoutePlanning, streets without the prefix `*` in the gazetteer are now searched for.
- Time handling: moment.js was replaced with day.js.
- addLayerRemotely:
    - addLayerRemotely can now be addressed via the remote interface using actions.
    - In addition, the possibility to switch layers visible or invisible has been added.
    - The documentation and the example have been extended.

## v2.29.0 - 2023-01-04
### __Breaking Changes__
Addon `obliqueViewer` was renamed to `vcOblique`.

---

## v2.26.0 - 2022-10-05
### Added
- The new addon [obliqueViewer](https://bitbucket.org/geowerkstatt-hamburg/addons/src/dev/obliqueViewer/) allows to configure oblique viewer in the Masterportal. Further details: [obliqueViewer documentation](https://bitbucket.org/geowerkstatt-hamburg/addons/src/dev/obliqueViewer/doc/config.json.md)
