import { IToolkit, OperationObject, PathItemObject, OpenAPIV3Schema } from './types';

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

  abstract generateSchema?(_args: { schemaName: string; schemaObject: OpenAPIV3Schema }): any;
}
