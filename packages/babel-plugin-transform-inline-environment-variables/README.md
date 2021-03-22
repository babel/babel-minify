# babel-plugin-transform-inline-environment-variables

Inline environment variables

## Example

### In

```js
// assuming process.env.NODE_ENV is actually "development"
process.env.NODE_ENV;
```

### Out

```js
"development";
```

## Installation

```sh
npm install babel-plugin-transform-inline-environment-variables --save-dev
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
// without options
{
  "plugins": ["transform-inline-environment-variables"]
}

// with options
{
  "plugins": [
    ["transform-inline-environment-variables", {
      "include": [
        "NODE_ENV"
      ],
      "required": [
        "NODE_ENV"
      ]
    }]
  ]
}
```

### Via CLI

```sh
babel --plugins transform-inline-environment-variables script.js
```

### Via Node API

```javascript
require("@babel/core").transform("code", {
  plugins: ["transform-inline-environment-variables"]
});
```

## Options

+ `include` - array of environment variables to include
+ `exclude` - array of environment variables to exclude
+ `required` - 
   - `array` - array of environment variables that are required. Will fail if they dont exists. 
   - `boolean` - **true** (all are required), **false** (none are required)
