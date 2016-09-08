# bunyan Changelog

## 0.4.0

- Log object fields with the built-in log streams (`{ obj: obj }`)
- Provide option in `ConsoleFormattedStream` to use full console log 
  level API (`console.info`, `console.warn`, etc)
- Get original node-bunyan test suite running, with non-browser-applicable
  test removed. This involved improving the internal, lightweight version of `util.format`
  
## 0.3.0

- [issue #1] Make `src` option work in the browser (logging line numbers)