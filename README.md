# @straw-hat/openapi-web-sdk-generator

## Usage
<!-- usage -->
```sh-session
$ npm install -g @straw-hat/openapi-web-sdk-generator
$ openapi-web-sdk-generator COMMAND
running command...
$ openapi-web-sdk-generator (-v|--version|version)
@straw-hat/openapi-web-sdk-generator/0.0.1 darwin-x64 node-v15.1.0
$ openapi-web-sdk-generator --help [COMMAND]
USAGE
  $ openapi-web-sdk-generator COMMAND
...
```
<!-- usagestop -->

<!-- commands -->
* [`openapi-web-sdk-generator help [COMMAND]`](#openapi-web-sdk-generator-help-command)
* [`openapi-web-sdk-generator local`](#openapi-web-sdk-generator-local)

## `openapi-web-sdk-generator help [COMMAND]`

display help for openapi-web-sdk-generator

```
USAGE
  $ openapi-web-sdk-generator help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `openapi-web-sdk-generator local`

Generate the code from a local OpenAPI V3 file.

```
USAGE
  $ openapi-web-sdk-generator local

OPTIONS
  --config=config                  (required) OpenAPI V3 configuration file.
  --output=output                  (required) Output directory path of the codegen.
```

_See code: [dist/commands/local.ts](https://github.com/straw-hat-team/openapi-web-sdk-generator/blob/v0.0.1/dist/commands/local.ts)_
<!-- commandsstop -->
