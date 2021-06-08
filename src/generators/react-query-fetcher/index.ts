import { CodegenBase } from '../../codegen-base';
import { OperationObject, PathItemObject } from '../../types';
import { ensureOperationId, forEachHttpOperation, getOperationDirectory, getOperationFilePath } from '../../helpers';
import path from 'path';
import { OutputDir } from '../../output-dir';
import { TemplateDir } from '../../template-dir';
import { camelCase, pascalCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';

const templateDir = new TemplateDir(
  path.join(__dirname, '..', '..', '..', 'templates', 'generators', 'react-query-fetcher')
);

function isQuery(operationMethod: string) {
  return OpenAPIV3.HttpMethods.GET.toUpperCase() == operationMethod.toUpperCase();
}

export interface ReactQueryFetcherCodegenOptions {
  outputDir: string;
  packageName: string;
}

export class ReactQueryFetcherCodegen extends CodegenBase<ReactQueryFetcherCodegenOptions> {
  private readonly packageName: string;
  readonly #outputDir: OutputDir;

  constructor(opts: ReactQueryFetcherCodegenOptions) {
    super(opts);
    this.#outputDir = new OutputDir(this.config.outputDir);
    this.packageName = opts.packageName;
  }

  #processOperation = (args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) => {
    ensureOperationId(args);

    const operationDirPath = getOperationDirectory(args.pathItem, args.operation);
    const operationFilePath = getOperationFilePath(operationDirPath, args.operation);
    const operationIndexImportPath = path.relative(
      this.#outputDir.resolveDir('index.ts'),
      this.#outputDir.resolve(operationFilePath)
    );

    this.#outputDir.createDirSync(operationDirPath);

    const sourceCode = isQuery(args.operationMethod)
      ? templateDir.render('query-operation.ts.ejs', {
          functionName: camelCase(args.operation.operationId),
          pascalFunctionName: pascalCase(args.operation.operationId),
          importPath: this.packageName,
        })
      : templateDir.render('mutation-operation.ts.ejs', {
          functionName: camelCase(args.operation.operationId),
          pascalFunctionName: pascalCase(args.operation.operationId),
          importPath: this.packageName,
        });

    this.#outputDir.writeFileSync(`use-${operationFilePath}.ts`, sourceCode);
    this.#outputDir.formatSync(`use-${operationFilePath}.ts`);

    this.#outputDir.appendFileSync(
      'index.ts',
      templateDir.render('index-export-statement.ts.ejs', {
        operationImportPath: operationIndexImportPath,
      })
    );
  };

  async generate() {
    this.#outputDir.resetDir();

    forEachHttpOperation(this.document, this.#processOperation);

    this.#outputDir.formatSync('index.ts');
  }
}
