import { OpenAPIV3 } from 'openapi-types';
import { OutputDir } from './output-dir';
import { CodegenBase } from './codegen-base';

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
  addGenerator(generator: CodegenBase): IToolkit;
}

export type OpenAPIV3Schema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;

export type OpenAPIV3Response = OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject;

export type OpenAPIV3RequestBody = OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;

export type OpenAPIV3Schemas = {
  [key: string]: OpenAPIV3Schema;
};
