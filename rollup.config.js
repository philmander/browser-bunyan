// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/browser-bunyan.min.js',
        format: 'umd',
    },
    name: 'bunyan',
    plugins: [
        resolve(),
        //commonjs(),
        babel({
            babelrc: false,

            "presets": [
                [
                    "env",
                    {
                        "modules": false
                    }
                ]
            ],
            "plugins": [
                "external-helpers"
            ],
            exclude: 'node_modules/**'
        }),
        uglify(),
    ],
};