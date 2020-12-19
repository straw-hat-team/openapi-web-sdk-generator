import { Command } from '@oclif/command';
import { loadConfig } from './helpers';
import { OpenApiWebSdkGenerator } from './open-api-web-sdk-generator';
import { FetcherCodegen } from './generators/fetcher';

export type ConfigFactory = (api: OpenApiWebSdkGenerator) => void;

function defaultConfigFactory(api: OpenApiWebSdkGenerator) {
  api.addGenerator(new FetcherCodegen(api));
}

export abstract class BaseCommand extends Command {
  configFactory: ConfigFactory = defaultConfigFactory;

  async init() {
    this.configFactory = loadConfig() ?? defaultConfigFactory;
  }
}
