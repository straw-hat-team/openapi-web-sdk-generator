import * as path from 'path';
import { ensureOperationId, forEachHttpOperation, getOperationDirectory, getOperationFilePath } from '../../helpers';
import { CodegenBase } from '../../codegen-base';
import { camelCase, pascalCase } from 'change-case';
import { OpenAPIV3Schema, OperationObject, PathItemObject } from '../../types';
import { OutputDir } from '../../output-dir';
import { TemplateDir } from '../../template-dir';

const templateDir = new TemplateDir(path.join(__dirname, '..', '..', '..', 'templates', 'generators', 'fetcher'));

export interface FetcherCodegenOptions {
  outputDir: string;
}

export default class FetcherCodegen extends CodegenBase<FetcherCodegenOptions> {
  readonly #outputDir: OutputDir;

  constructor(opts: FetcherCodegenOptions) {
    super(opts);
    this.#outputDir = new OutputDir(this.options.outputDir);
  }

  #processSchema = (args: { schemaName: string; schemaObject: OpenAPIV3Schema }) => {
    const normalizedSchemaName = pascalCase(args.schemaName);
    this.#outputDir.appendFileSync(`components/schemas.ts`, `type ${normalizedSchemaName} = any;\n`);
  };

  #processOperation = (args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) => {
    ensureOperationId(args);

    const operationDirPath = getOperationDirectory(args.pathItem, args.operation);
    const operationFilePath = getOperationFilePath(operationDirPath, args.operation);
    const functionName = camelCase(args.operation.operationId);
    const typePrefix = pascalCase(args.operation.operationId);
    const operationIndexImportPath = path.relative(
      this.#outputDir.resolveDir('index.ts'),
      this.#outputDir.resolve(operationFilePath)
    );

    this.#outputDir.createDirSync(operationDirPath);

    this.#outputDir.writeFileSync(
      `${operationFilePath}.ts`,
      templateDir.render('operation.ts.ejs', {
        functionName,
        typePrefix,
        operationMethod: args.operationMethod.toUpperCase(),
        operationPath: args.operationPath,
      })
    );

    this.#outputDir.formatSync(`${operationFilePath}.ts`);

    this.#outputDir.appendFileSync(
      'index.ts',
      templateDir.render('index-export-statement.ts.ejs', {
        operationImportPath: operationIndexImportPath,
      })
    );
  };

  async generate() {
    this.#outputDir.resetDir();
    this.#outputDir.createDirSync('components');

    for (const [schemaName, schemaObject] of Object.entries<OpenAPIV3Schema>(this.document.components?.schemas ?? {})) {
      this.#processSchema({ schemaName, schemaObject });
    }

    forEachHttpOperation(this.document, this.#processOperation);

    this.#outputDir.formatSync('index.ts');
  }
}
