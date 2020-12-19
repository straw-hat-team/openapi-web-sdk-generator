import type { OpenAPIV3 } from 'openapi-types';
import { OutputDir } from './output-dir';
import { OperationObject, PathItemObject } from './types';
import { hasOperationId, isOperationKey } from './helpers';
import { CodegenBase } from './codegen-base';
import * as prettier from './prettier';

export interface OpenApiWebSdkGeneratorArgs {
  document: OpenAPIV3.Document;
  paths: {
    outputDir: string;
  };
}

export class OpenApiWebSdkGenerator {
  public outputDir: OutputDir;
  public document: OpenAPIV3.Document;
  public generators: Set<CodegenBase>;

  constructor(args: OpenApiWebSdkGeneratorArgs) {
    this.document = args.document;
    this.outputDir = new OutputDir(args.paths.outputDir);
    this.generators = new Set();
  }

  addGenerator(generator: CodegenBase) {
    this.generators.add(generator);
    return this;
  }

  formatCode(sourceCode: string) {
    return prettier.format(sourceCode);
  }

  generate() {
    this.outputDir.resetDir();

    for (const [operationPath, pathItem] of Object.entries<PathItemObject>(this.document.paths)) {
      for (const [operationMethod, operation] of Object.entries<OperationObject>(pathItem as any)) {
        if (!isOperationKey(operationMethod)) {
          continue;
        }

        if (!hasOperationId(operation)) {
          throw new Error(`Operation Id is missing for "${operationMethod} ${operationPath} "`);
        }

        this.generators.forEach((generator) =>
          generator.generateOperation({
            operation,
            operationPath,
            operationMethod,
            pathItem,
          })
        );
      }
    }
  }
}
