import { OpenAPIV3 } from 'openapi-types';

export interface OperationObject extends OpenAPIV3.OperationObject {
  'x-directories'?: string[];
  operationId: string;
}

// Remove when the following PR is in production
// https://github.com/kogosoftwarellc/open-api/pull/748
export interface PathItemObject extends OpenAPIV3.PathItemObject<OperationObject> {
  'x-directories'?: string[];
}

export type OpenAPIV3Schema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
