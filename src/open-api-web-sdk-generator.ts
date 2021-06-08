import type { OpenAPIV3 } from 'openapi-types';
import { CodegenBase } from './codegen-base';

export interface OpenApiWebSdkGeneratorArgs {
  document: OpenAPIV3.Document;
}

export class OpenApiWebSdkGenerator {
  public document: OpenAPIV3.Document;
  public generators: Set<CodegenBase>;

  constructor(args: OpenApiWebSdkGeneratorArgs) {
    this.document = args.document;
    this.generators = new Set();
  }

  addGenerator(generator: CodegenBase) {
    this.generators.add(generator);
    return this;
  }

  async generate() {
    this.generators.forEach((generator) => {
      generator.setDocument(this.document);
      generator.generate();
    });
  }
}
