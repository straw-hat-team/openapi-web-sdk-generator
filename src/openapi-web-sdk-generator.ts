import type { OpenAPIV3 } from 'openapi-types';
import { CodegenBase } from './codegen-base';
import { createDebugger } from './helpers';

const debug = createDebugger('open-api-web-sdk-generator');

export interface OpenApiWebSdkGeneratorConfiguration {
  generators?: Array<{
    path: string;
    config?: any;
  }>;
}

export interface OpenApiWebSdkGeneratorArgs {
  document: OpenAPIV3.Document;
  config: OpenApiWebSdkGeneratorConfiguration;
}

export class OpenapiWebSdkGenerator {
  readonly #generators = new Set<CodegenBase>();
  readonly #document: OpenAPIV3.Document;
  readonly #config: OpenApiWebSdkGeneratorConfiguration;

  constructor(args: OpenApiWebSdkGeneratorArgs) {
    this.#document = args.document;
    this.#config = args.config;
  }

  async loadGenerators() {
    (this.#config.generators ?? []).forEach((config) => {
      try {
        debug(`Loading Generator: ${config.path}`);
        const Generator = require(config.path);
        this.#generators.add(new Generator(config.config));
      } catch (e) {
        throw new Error(`Failed to load configuration file ${config.path}.\n${e.message}`);
      }
    });
  }

  async generate() {
    this.#generators.forEach((generator) => {
      generator.setDocument(this.#document);
      generator.generate();
    });
  }
}
