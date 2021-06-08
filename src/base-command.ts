import { Command } from '@oclif/command';
import { loadConfig } from './helpers';
import { OpenApiWebSdkGenerator } from './open-api-web-sdk-generator';

export type ConfigFactory = (api: OpenApiWebSdkGenerator) => void;

const DEFAULT_CONFIG_FACTORY = Function.prototype as ConfigFactory;

export abstract class BaseCommand extends Command {
  configFactory: ConfigFactory = DEFAULT_CONFIG_FACTORY;

  async init() {
    this.configFactory = loadConfig() ?? DEFAULT_CONFIG_FACTORY;
  }
}
