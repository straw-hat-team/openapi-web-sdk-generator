import { IToolkit, OperationObject, PathItemObject, OpenAPIV3Schema } from './types';
import type { OpenAPIV3 } from 'openapi-types';

export abstract class CodegenBase {
  toolkit: IToolkit;

  constructor(toolkit: IToolkit) {
    this.toolkit = toolkit;
  }

  abstract generateOperation?(_args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }): any;

  abstract afterAll?(_args: { document: OpenAPIV3.Document }): any;

  abstract generateSchema?(_args: { schemaName: string; schemaObject: OpenAPIV3Schema }): any;
}
