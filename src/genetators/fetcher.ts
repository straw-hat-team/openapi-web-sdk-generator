import { camelCase, pascalCase } from 'change-case';
import * as prettier from '../prettier';
import { getOperationDirectory, getOperationFileName } from '../helpers';
import { TemplateDir } from '../template-dir';
import path from 'path';
import { CodegenBase } from '../codegen-base';
import { OperationObject, PathItemObject } from '../types';

const templateDir = new TemplateDir(path.join(__dirname, '..', '..', 'templates', 'generators', 'fetcher'));

export class FetcherCodegen extends CodegenBase {
  generateOperation(args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) {
    const operationDirPath = getOperationDirectory(args.pathItem, args.operation);
    const operationFilePath = getOperationFileName(operationDirPath, args.operation);

    this.toolkit.outputDir.createDirSync(operationDirPath);

    const sourceCode = templateDir.render('operation.ts.ejs', {
      functionName: camelCase(args.operation.operationId),
      typePrefix: pascalCase(args.operation.operationId),
      operationMethod: args.operationMethod.toUpperCase(),
      operationPath: args.operationPath,
    });

    const formattedSourceCode = prettier.format(sourceCode);

    this.toolkit.outputDir.writeFileSync(operationFilePath, formattedSourceCode);
  }
}
