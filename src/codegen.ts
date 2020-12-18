import type { OpenAPIV3 } from 'openapi-types';
import * as fs from 'fs';
import { OutputDir } from './output-dir';
import { PathItem, PathItemObject } from './path-item';
import { PathsConfig } from './operation';

export function readConfig(filePath: string): OpenAPIV3.Document {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} OpenAPI file does not exists.`);
  }

  if (!fs.statSync(filePath).isFile()) {
    throw new Error(`${filePath} is not a file.`);
  }

  const fileData = fs.readFileSync(filePath).toString();
  return JSON.parse(fileData);
}

export interface CodegenConfig {
  config: OpenAPIV3.Document;
  paths: PathsConfig;
}

export class Codegen {
  private outputDir: OutputDir;
  private paths: PathsConfig;
  private config: OpenAPIV3.Document;

  constructor(args: CodegenConfig) {
    this.config = args.config;
    this.paths = args.paths;
    this.outputDir = new OutputDir(args.paths.outputDir);
  }

  generate() {
    this.outputDir.resetDir();

    return Object.entries<OpenAPIV3.PathItemObject>(this.config.paths)
      .map(this.createPathItemFromTuple)
      .map(this.generatePathItem);
  }

  private generatePathItem(pathItem: PathItem) {
    return pathItem.generate();
  }

  private createPathItemFromTuple = ([operationPath, config]: [string, PathItemObject]) => {
    return new PathItem({
      operationPath,
      config,
      document: this.config,
      paths: this.paths,
    });
  };
}
