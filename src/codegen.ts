import type { OpenAPIV3 } from 'openapi-types';
import * as fs from 'fs';
import { OutputDir } from './output-dir';
import { FetcherCodegen } from './genetators/fetcher';
import { OperationObject, PathItemObject } from './types';
import { hasOperationId, isOperationKey } from './helpers';
import { CodegenBase } from './codegen-base';

export function readOpenApiFile(filePath: string): OpenAPIV3.Document {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} OpenAPI file does not exists.`);
  }

  if (!fs.statSync(filePath).isFile()) {
    throw new Error(`${filePath} is not a file.`);
  }

  const fileData = fs.readFileSync(filePath).toString();
  return JSON.parse(fileData);
}

export interface CodegenArgs {
  document: OpenAPIV3.Document;
  paths: {
    outputDir: string;
  };
}

export class Codegen {
  public outputDir: OutputDir;
  public document: OpenAPIV3.Document;
  public generators: Set<CodegenBase>;

  constructor(args: CodegenArgs) {
    this.document = args.document;
    this.outputDir = new OutputDir(args.paths.outputDir);
    this.generators = new Set([new FetcherCodegen(this)]);
  }

  addGenerator(generator: CodegenBase) {
    this.generators.add(generator);
    return this;
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
