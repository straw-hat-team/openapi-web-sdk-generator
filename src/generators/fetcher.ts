import { camelCase, pascalCase } from 'change-case';
import { getOperationDirectory, getOperationFilePath } from '../helpers';
import { TemplateDir } from '../template-dir';
import * as path from 'path';
import { CodegenBase } from '../codegen-base';
import { IToolkit, OperationObject, PathItemObject } from '../types';

const templateDir = new TemplateDir(path.join(__dirname, '..', '..', 'templates', 'generators', 'fetcher'));

function renderOperationExportStatement(args: { operationExportPath: string }) {
  return templateDir.render('index-export-statement.ts.ejs', {
    operationFileName: args.operationExportPath,
  });
}

function renderOperationFileSourceCode(args: {
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

export interface FetcherCodegenConfig {
  dirPath?: string;
}

export class FetcherCodegen extends CodegenBase {
  private dirPath: string;

  constructor(toolkit: IToolkit, args?: FetcherCodegenConfig) {
    super(toolkit);
    this.dirPath = args?.dirPath ?? '.';
  }

  generateOperation(args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) {
    const indexFilePath = path.join(this.dirPath, 'index.ts');
    const operationDirPath = path.join(this.dirPath, getOperationDirectory(args.pathItem, args.operation));
    const operationFilePath = getOperationFilePath(operationDirPath, args.operation);
    const operationExportPath = path.relative(this.dirPath, operationFilePath);

    this.toolkit.outputDir.createDirSync(operationDirPath);

    this.toolkit.outputDir.writeFileSync(
      `${operationFilePath}.ts`,
      this.toolkit.formatCode(renderOperationFileSourceCode(args))
    );

    this.toolkit.outputDir.appendFileSync(
      indexFilePath,
      renderOperationExportStatement({ operationExportPath: operationExportPath })
    );
  }
}
