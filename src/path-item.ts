import type { OpenAPIV3 } from 'openapi-types';
import { Operation, OperationInfoObject } from './operation';

export interface PathItemObject extends OpenAPIV3.PathItemObject {
  'x-directories'?: string[];
}

export interface PathItemArgs {
  operationPath: string;
  document: OpenAPIV3.Document;
  config: PathItemObject;
  paths: {
    outputDir: string;
    httpClient: string;
  };
}

export class PathItem {
  private operationPath: string;
  private config: PathItemObject;
  private document: OpenAPIV3.Document;
  private paths: {
    outputDir: string;
    httpClient: string;
  };

  constructor(args: PathItemArgs) {
    this.operationPath = args.operationPath;
    this.config = args.config;
    this.document = args.document;
    this.paths = args.paths;
  }

  generate() {
    return Object.entries(this.config)
      .filter(Operation.isOperationTuple)
      .map(this.createOperationFromTuple)
      .map((operationItem) => operationItem.generate());
  }

  private createOperationFromTuple = ([operationMethod, config]: [
    string,
    OpenAPIV3.OperationObject
  ]) => {
    return new Operation({
      operationPath: this.operationPath,
      operationMethod,
      config: config as OperationInfoObject,
      document: this.document,
      extraSummary: this.config.summary,
      extraDescription: this.config.description,
      extraServers: this.config.servers,
      extraParameters: this.config.parameters,
      extraDirectories: this.config['x-directories'],
      paths: this.paths,
    });
  };
}
