import { IToolkit, OperationObject, PathItemObject } from './types';

export abstract class CodegenBase {
  toolkit: IToolkit;

  constructor(toolkit: IToolkit) {
    this.toolkit = toolkit;
  }

  abstract generateOperation(_args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }): any;
}
