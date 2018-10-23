## Contributing

Browser Bunyan uses [Lerna](https://github.com/lerna/lerna) for managing 
its core and stream packages and share dependencies.

Each package can be found in the `./packages` directory. Build and test all packages
from the root directory by running `npm bootstrap` and `npm run test` from the root
directory respectively.

```
npm i
npm run bootstrap
npm run test
```

# Builds

```
 cd packages/<package-name>
 npm run build
```

Each package uses [microbundle](https://github.com/developit/microbundle) to create
ESM, CJS and UMD builds.

# Test

```
 cd packages/<package-name>
 npm test
```

Test are written using [Tap](https://www.node-tap.org)

You can manually test the UMD build by opening [./examples/index.html](./examples/index.html)
in a browser and inspecting the console.

# Publish

Publish all udpdated packages to NPM:

`npm run publish`

(see [@lerna/publish](https://github.com/lerna/lerna/tree/master/commands/publish#readme))

# Work with local copies
To change any of the packages, you will need to make sure there is a valid build, to do this execute: `npm run build`

Then you can simply go into the directory of the package perform the normal [`npm link`](https://docs.npmjs.com/cli/link) commands.

For example, for `browser-bunyan`:
```bash
cd package/browser-bunyan
npm link

cd /path/to/project
npm link browser-bunyan 
```

for the console stream packages it is a little different:
```bash
cd package/console-formatted-stream

cd /path/to/project
npm link @browser-bunyan/console-formatted-stream
```

**Note:** If you have trouble with the `npm link` command then try removing `package-lock.json` and retry.

### Inspecting
In most cases the source code maps should work fine for inspecting the code. There are some cases where the source maps may not work properly.  For those cases you may want the code to be built with minification turned off.

To do this, go into the relevant `package.json` in the package you want to build without minifying and modify the `build` script to add the `--compress false` option.

For example, in `package/browser-bunyan`:
```
    "build": "../../node_modules/.bin/microbundle --compress false --name bunyan && ../../node_modules/.bin/mkdirp dist && cp lib/index.umd.js dist/browser-bunyan.min.js",

```
