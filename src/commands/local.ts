import { flags } from '@oclif/command';
import { OpenapiWebSdkGenerator } from '../openapi-web-sdk-generator';
import { readOpenApiFile } from '../helpers';
import { BaseCommand } from '../base-command';

export default class LocalCommand extends BaseCommand {
  static description = 'Generate the code from a local OpenAPI V3 file.';

  static flags = {
    config: flags.string({
      required: true,
      description: 'OpenAPI V3 configuration file.',
    }),
  };

  async run() {
    const { flags } = this.parse(LocalCommand);

    const generator = new OpenapiWebSdkGenerator({
      context: process.cwd(),
      document: readOpenApiFile(flags.config),
      config: this.configuration,
    });

    await generator.loadGenerators();
    await generator.generate();
  }
}
