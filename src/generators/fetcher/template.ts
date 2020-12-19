import { TemplateDir } from '../../template-dir';
import path from 'path';
import { OperationObject } from '../../types';
import { camelCase, pascalCase } from 'change-case';

const templateDir = new TemplateDir(path.join(__dirname, '..', '..', '..', 'templates', 'generators', 'fetcher'));

export function renderOperationExportStatement(args: { operationExportPath: string }) {
  return templateDir.render('index-export-statement.ts.ejs', {
    operationFileName: args.operationExportPath,
  });
}

export function renderOperationFileSourceCode(args: {
  operationMethod: string;
  operationPath: string;
  operation: OperationObject;
}) {
  return templateDir.render('operation.ts.ejs', {
    functionName: camelCase(args.operation.operationId),
    typePrefix: pascalCase(args.operation.operationId),
    operationMethod: args.operationMethod.toUpperCase(),
    operationPath: args.operationPath,
  });
}
