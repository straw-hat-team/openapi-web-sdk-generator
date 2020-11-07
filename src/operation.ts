import path from 'path';
import type { OpenAPIV3 } from 'openapi-types';
import { OutDir, TemplateDir } from './directories';
import { createDebugger } from './debug';
import camelCase from 'camelcase';
import * as prettier from './prettier';

export interface OperationInfoObject extends OpenAPIV3.OperationObject {
  'x-directories'?: string[];
}

export interface OperationArgs {
  operationPath: string;
  operationMethod: string;
  document: OpenAPIV3.Document;
  config: OperationInfoObject;
  extraSummary?: string;
  extraDescription?: string;
  extraServers?: OpenAPIV3.ServerObject[];
  extraParameters?: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>;
  extraDirectories?: string[];
  paths: {
    outputDir: string;
    httpClient: string;
  };
}

export class Operation {
  private debug = createDebugger('operation');
  private operationPath: string;
  private operationMethod: string;
  private config: OperationInfoObject;
  private document: OpenAPIV3.Document;
  private outputDir: OutDir;
  private extraParameters: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>;
  private extraDirectories: string[];
  private paths: {
    outputDir: string;
    httpClient: string;
  };
  private templateDir: TemplateDir;

  constructor(args: OperationArgs) {
    this.operationPath = args.operationPath;
    this.operationMethod = args.operationMethod;
    this.config = args.config;
    this.document = args.document;
    this.outputDir = new OutDir(args.paths.outputDir);
    this.extraParameters = args.extraParameters ?? [];
    this.extraDirectories = args.extraDirectories ?? [];
    this.paths = args.paths;
    this.templateDir = new TemplateDir(path.join(__dirname, '..', 'templates'));
  }

  generate() {
    this.createOperationDir();
    this.addOperation();
  }

  async addOperation() {
    const sourceCode = this.templateDir.render('operation.ts.ejs', {
      functionName: this.operationName,
      importsPath: this.operationImportsPath,
      method: this.operationMethod.toUpperCase(),
      path: this.operationPath,
    });

    this.debug('Formatting operation');
    const formatted = prettier.format(sourceCode);
    this.debug('Writing operation');
    this.outputDir.appendFileSync(this.operationFilePath, formatted);
  }

  createOperationDir() {
    this.outputDir.createDir(this.directoryPath);
  }

  get operationName() {
    return camelCase(this.config.operationId);
  }

  get directoryPath() {
    const directories = this.config['x-directories'] ?? [];
    const normalizedDirNames = this.extraDirectories.concat(directories).map(this.normalizeDirName);

    return path.join(...normalizedDirNames);
  }

  normalizeDirName(dirName: string) {
    return dirName.toLowerCase();
  }

  get operationFilePath() {
    return path.join(this.directoryPath, `${this.operationName}.ts`);
  }

  get operationImportsPath() {
    const operationsFilePath = this.outputDir.resolve(this.operationFilePath);
    const operationsFileDir = path.dirname(operationsFilePath);
    const httpClientDir = path.dirname(this.paths.httpClient);
    return path.relative(operationsFileDir, httpClientDir);
  }

  static isOperationTuple(tuple: [string, unknown]) {
    return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(tuple[0]);
  }
}
