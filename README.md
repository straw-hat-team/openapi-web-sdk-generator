# @straw-hat/openapi-web-sdk-generator

## Usage

Before anything, we need to enable the generators, to do that we will create a
file in the package root directory called `openapi-web-sdk-generator.config.js`.

```bash 
touch openapi-web-sdk-generator.config.js
```

Then add the generators.

```js
// <rootDir>/openapi-web-sdk-generator.config.js

const {
  ReactQueryFetcherCodegen,
  FetcherCodegen,
} = require('@straw-hat/openapi-web-sdk-generator/dist/generators');

// Make sure to export a function like the following one
module.exports = (toolkit) => {
  // Use toolkit.addGenerator to add generators
  
  // Generates operations for @straw-hat/fetcher package
  toolkit.addGenerator(new FetcherCodegen(toolkit));
};
```

Run the generator command.

```bash
sht-openapi-web-sdk-generator local \
  --config='./data/openapi.json' \
  --output='./src/operations'
```

<!-- commands -->

## Command Topics

* [`sht-openapi-web-sdk-generator help`](docs/commands/help.md) - display help
  for sht-openapi-web-sdk-generator
* [`sht-openapi-web-sdk-generator local`](docs/commands/local.md) - Generate the
  code from a local OpenAPI V3 file.

<!-- commandsstop -->

## What's next?

- [Custom generators](./docs/custom-generators.md)
