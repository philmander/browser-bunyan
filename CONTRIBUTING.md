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