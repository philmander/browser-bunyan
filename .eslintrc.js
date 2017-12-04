module.exports = {
    "env": {
        "browser": true,
        "es6": true,
    },
    "globals": {
        "process": true
    },
    "extends": ["eslint:recommended" ],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
    ],
    "rules": {
        "no-console" : [
            "off"
        ],
        "curly" : [
            "error", "all"
        ],
        "brace-style": [
            1, "1tbs", {
            "allowSingleLine": false
        }
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "error",
            { "varsIgnorePattern": "^h$" }
        ],
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "no-multiple-empty-lines" : [
            "error",
            { max: 1 }
        ],
        "padded-blocks" : [
            "error",
            { "blocks" : "never" }
        ]
    }
};