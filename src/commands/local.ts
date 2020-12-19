import * as path from 'path';
import { flags } from '@oclif/command';
import { OpenApiWebSdkGenerator } from '../open-api-web-sdk-generator';
import { readOpenApiFile } from '../helpers';
import { BaseCommand } from '../base-command';

export default class LocalCommand extends BaseCommand {
  static description = 'Generate the code from a local OpenAPI V3 file.';

  static flags = {
    config: flags.string({
      required: true,
      description: 'OpenAPI V3 configuration file.',
    }),
    output: flags.string({
      required: true,
      description: 'Output directory path of the codegen.',
    }),
  };

  async run() {
    const { flags } = this.parse(LocalCommand);

    const generator = new OpenApiWebSdkGenerator({
      document: readOpenApiFile(flags.config),
      paths: {
        outputDir: path.resolve(flags.output),
      },
    });

    this.configFactory(generator);

    generator.generate();
  }
}
