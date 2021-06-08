import type { OpenAPIV3 } from 'openapi-types';
import { CodegenBase } from './codegen-base';
import { createDebugger } from './helpers';
import importFrom from 'import-from';
const debug = createDebugger('open-api-web-sdk-generator');

export interface OpenApiWebSdkGeneratorConfiguration {
  generators?: Array<{
    path: string;
    config?: any;
  }>;
}

export interface OpenApiWebSdkGeneratorArgs {
  context: string;
  document: OpenAPIV3.Document;
  config: OpenApiWebSdkGeneratorConfiguration;
}

export class OpenapiWebSdkGenerator {
  readonly #generators = new Set<CodegenBase>();
  readonly #document: OpenAPIV3.Document;
  readonly #context: string;
  readonly #config: OpenApiWebSdkGeneratorConfiguration;

  constructor(args: OpenApiWebSdkGeneratorArgs) {
    this.#document = args.document;
    this.#config = args.config;
    this.#context = args.context;
  }

  async loadGenerators() {
    (this.#config.generators ?? []).forEach((config) => {
      try {
        debug(`Loading Generator: ${config.path}`);
        const pkg: any = importFrom(this.#context, config.path);
        const Generator = pkg.__esModule ? pkg.default : pkg;
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
