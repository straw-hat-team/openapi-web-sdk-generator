import { OperationObject, PathItemObject } from '../types';
import { paramCase } from 'change-case';
import * as path from 'path';
import { OpenAPIV3 } from 'openapi-types';
import * as fs from 'fs';

export function isOperationKey(key: string) {
  return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(key);
}

export function hasOperationId(operation: OperationObject) {
  return !!operation.operationId;
}

export function normalizeFileName(fileName: string) {
  return paramCase(fileName.toLowerCase());
}

export function getOperationDirectory(pathItem: PathItemObject, operation: OperationObject) {
  const pathDirectories = pathItem['x-directories'] ?? [];
  const operationDirectories = operation['x-directories'] ?? [];
  const normalizedDirNames = pathDirectories.concat(operationDirectories).map(normalizeFileName);
  return path.join(...normalizedDirNames);
}

export function getOperationFileName(operationDirPath: string, operation: OperationObject, ext = 'ts') {
  const normalizedName = normalizeFileName(operation.operationId!);
  return path.join(operationDirPath, `${normalizeFileName(normalizedName)}.${ext}`);
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

export function loadConfig() {
  const filePath = path.resolve(process.cwd(), 'openapi-web-sdk-generator.config.js');

  if (!fs.existsSync(filePath)) {
    return;
  }

  return require(filePath);
}
