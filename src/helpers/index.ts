import { OperationObject, PathItemObject } from '../types';
import { paramCase } from 'change-case';
import * as path from 'path';
import { OpenAPIV3 } from 'openapi-types';
import * as fs from 'fs';
import debugFactory from 'debug';
import { OperationIdMissingError } from '../operation-id-missing-error';
import { cosmiconfig } from 'cosmiconfig';
import { OpenApiWebSdkGeneratorConfiguration } from '../openapi-web-sdk-generator';

const cosmiconfigExplorer = cosmiconfig('openapi-web-sdk-generator');
const debug = createDebugger('helpers');

export function createDebugger(...scope: string[]) {
  const namespace = ['@straw-hat/openapi-web-sdk-generator', ...scope].join(':');
  return debugFactory(namespace);
}

export function hasOperationId(operation: OperationObject) {
  return !!operation.operationId;
}

export function normalizeFileName(fileName: string) {
  return paramCase(fileName).toLowerCase();
}

export function getOperationDirectory(pathItem: PathItemObject, operation: OperationObject) {
  const pathDirectories = pathItem['x-directories'] ?? [];
  const operationDirectories = operation['x-directories'] ?? [];
  const normalizedDirNames = pathDirectories.concat(operationDirectories).map(normalizeFileName);
  return path.join(...normalizedDirNames);
}

export function getOperationFilePath(operationDirPath: string, operation: OperationObject) {
  const normalizedName = normalizeFileName(operation.operationId!);
  return path.join(operationDirPath, normalizeFileName(normalizedName));
}

export function readOpenApiFile(filePath: string): OpenAPIV3.Document {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} OpenAPI file does not exists.`);
  }

  if (!fs.statSync(filePath).isFile()) {
    throw new Error(`${filePath} is not a file.`);
  }

  const fileData = fs.readFileSync(filePath).toString();
  return JSON.parse(fileData);
}

export async function loadConfig(): Promise<OpenApiWebSdkGeneratorConfiguration> {
  const result = await cosmiconfigExplorer.search();

  if (!result) {
    return {};
  }

  debug(`Configuration file ${result?.filepath} loaded`);
  return (result?.config as OpenApiWebSdkGeneratorConfiguration) ?? {};
}

export function forEachHttpOperation(
  document: OpenAPIV3.Document,
  callback: (args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) => any
) {
  for (const [operationPath, pathItem] of Object.entries<PathItemObject>(document.paths as any)) {
    for (const operationMethod of Object.values(OpenAPIV3.HttpMethods)) {
      const operation = pathItem[operationMethod];

      if (!operation) {
        continue;
      }

      callback({ operation, operationPath, operationMethod, pathItem });
    }
  }
}

export function ensureOperationId(args: {
  operationMethod: string;
  operationPath: string;
  operation: OperationObject;
}) {
  if (!hasOperationId(args.operation)) {
    throw new OperationIdMissingError(args.operationPath, args.operationMethod);
  }
}
