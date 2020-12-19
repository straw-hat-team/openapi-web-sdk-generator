import { IToolkit, OperationObject, PathItemObject } from './types';
import { MissingImplementation } from './errors';

export class CodegenBase {
  toolkit: IToolkit;

  constructor(toolkit: IToolkit) {
    this.toolkit = toolkit;
  }

  generateOperation(_args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) {
    throw new MissingImplementation(this, 'generateOperation');
  }
}
