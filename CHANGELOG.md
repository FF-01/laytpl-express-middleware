# Change Log
All notable changes to this project will be documented in this file.

Original laytpl github repo are deleted, so i just put this one on with some fixes from me.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [2.0.0] - 2021-01-20

Here we would have the update steps for 2.0.0 for people to follow.

### Changed

-  ` include` function in `laytpl.js` is been modified, now is possible pass multiple part of path.

### Fixed

- Fix include nesting include directive issue. 

  Now nesting include file path is based on the current included file, instead of the express render file path.

  Example:
  `/view/index.html` (express render path)

  ```html
  <# include ../inc/header #>
  <p>hello, world!</p>
  ```

  `/inc/header.html`

  ```html
  <h1>Site</h1>
  <# include style/shared #>
  ```

  `/inc/style/shared.html`

  ```html
  <link rel="stylesheet" href="https://exmaple.com/static/lib/layui/css/layui.css">
  ```

  This will actually work now, before the fix it will try load `/view/style/shared.html`, which is completely broken.
