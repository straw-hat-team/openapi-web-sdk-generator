import { IToolkit, OperationObject, PathItemObject } from './types';
import type { OpenAPIV3 } from 'openapi-types';

export abstract class CodegenBase {
  toolkit: IToolkit;

  constructor(toolkit: IToolkit) {
    this.toolkit = toolkit;
  }

  abstract onBeforeAll(_args: { document: OpenAPIV3.Document }): void;

  abstract onGenerateOperation?(_args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }): void;

  abstract onAfterAll(_args: { document: OpenAPIV3.Document }): void;
}
