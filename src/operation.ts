import path from 'path';
import type { OpenAPIV3 } from 'openapi-types';
import { camelCase, pascalCase } from 'change-case';
import { OutputDir } from './output-dir';
import { TemplateDir } from './template-dir';
import { createDebugger } from './debug';
import * as prettier from './prettier';

export function isOperationTuple(tuple: [string, unknown]) {
  return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(tuple[0]);
}

export interface OperationInfoObject extends OpenAPIV3.OperationObject {
  'x-directories'?: string[];
}

export type PathsConfig = {
  outputDir: string;
};

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
  paths: PathsConfig;
}

export class Operation {
  private debug = createDebugger('operation');
  private operationPath: string;
  private operationMethod: string;
  private config: OperationInfoObject;
  // @ts-ignore
  private document: OpenAPIV3.Document;
  private outputDir: OutputDir;
  // @ts-ignore
  private extraParameters: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>;
  private extraDirectories: string[];
  // @ts-ignore
  private paths: PathsConfig;
  private templateDir: TemplateDir;

  constructor(args: OperationArgs) {
    this.operationPath = args.operationPath;
    this.operationMethod = args.operationMethod;
    this.config = args.config;
    this.document = args.document;
    this.outputDir = new OutputDir(args.paths.outputDir);
    this.extraParameters = args.extraParameters ?? [];
    this.extraDirectories = args.extraDirectories ?? [];
    this.paths = args.paths;
    this.templateDir = new TemplateDir(path.join(__dirname, '..', 'templates'));
  }

  generate() {
    this.createOperationDir();
    this.addOperation();
  }

  private async addOperation() {
    const sourceCode = this.templateDir.render('operation.ts.ejs', {
      functionName: this.operationName,
      typePrefix: pascalCase(this.operationName),
      operationMethod: this.operationMethod.toUpperCase(),
      operationPath: this.operationPath,
    });

    this.debug('Formatting operation');
    const formatted = prettier.format(sourceCode);
    this.debug('Writing operation');
    this.outputDir.appendFileSync(this.operationFilePath, formatted);
  }

  private createOperationDir() {
    this.outputDir.createDir(this.directoryPath);
  }

  private get operationName() {
    if (!this.config.operationId) {
      throw new Error(`Operation Id is missing for "${this.operationMethod} ${this.operationPath} "`);
    }

    return camelCase(this.config.operationId);
  }

  private get directoryPath() {
    const directories = this.config['x-directories'] ?? [];
    const normalizedDirNames = this.extraDirectories.concat(directories).map(this.normalizeDirName);

    return path.join(...normalizedDirNames);
  }

  private normalizeDirName(dirName: string) {
    return dirName.toLowerCase();
  }

  private get operationFilePath() {
    return path.join(this.directoryPath, `${this.operationName}.ts`);
  }
}
