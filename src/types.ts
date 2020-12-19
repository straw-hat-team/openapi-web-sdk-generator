import { OpenAPIV3 } from 'openapi-types';
import { OutputDir } from './output-dir';

export interface OperationObject extends OpenAPIV3.OperationObject {
  'x-directories'?: string[];
  operationId: string;
}

export interface PathItemObject extends OpenAPIV3.PathItemObject {
  'x-directories'?: string[];
}

export interface IToolkit {
  outputDir: OutputDir;
  formatCode(sourceCode: string): string;
}
