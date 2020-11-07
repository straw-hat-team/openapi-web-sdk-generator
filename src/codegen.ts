import type { OpenAPIV3 } from 'openapi-types';
import * as jetpack from 'fs-jetpack';
import { OutDir } from './directories';
import { PathItem, PathItemObject } from './path-item';

export interface CodegenConfig {
  config: OpenAPIV3.Document;
  paths: {
    outputDir: string;
    httpClient: string;
  };
}

export class Codegen {
  private outputDir: OutDir;
  private paths: {
    outputDir: string;
    httpClient: string;
  };
  private config: OpenAPIV3.Document;

  constructor(args: CodegenConfig) {
    this.config = args.config;
    this.paths = args.paths;
    this.outputDir = new OutDir(args.paths.outputDir);
  }

  static readConfig(filePath: string): OpenAPIV3.Document {
    const fileData = jetpack.read(filePath);
    return JSON.parse(fileData.toString());
  }

  generate() {
    this.outputDir.resetDir();

    return Object.entries<OpenAPIV3.PathItemObject>(this.config.paths)
      .map(this.createPathItemFromTuple)
      .map((pathItem) => pathItem.generate());
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
