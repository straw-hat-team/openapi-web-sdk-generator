import { OperationObject } from '../../types';
import { camelCase, pascalCase } from 'change-case';
import { TemplateDir } from '../../template-dir';
import path from 'path';

const templateDir = new TemplateDir(
  path.join(__dirname, '..', '..', '..', 'templates', 'generators', 'react-query-fetcher')
);

export function renderOperationExportStatement(args: { operationExportPath: string }) {
  return templateDir.render('index-export-statement.ts.ejs', {
    operationFileName: args.operationExportPath,
  });
}

export function getMutationOperationSourceCode(args: { operation: OperationObject; importPath: string }) {
  return templateDir.render('mutation-operation.ts.ejs', {
    functionName: camelCase(args.operation.operationId),
    pascalFunctionName: pascalCase(args.operation.operationId),
    importPath: args.importPath,
  });
}

export function getQueryOperationSourceCode(args: { operation: OperationObject; importPath: string }) {
  return templateDir.render('query-operation.ts.ejs', {
    functionName: camelCase(args.operation.operationId),
    pascalFunctionName: pascalCase(args.operation.operationId),
    importPath: args.importPath,
  });
}
