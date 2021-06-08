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

export default class ReactQueryFetcherCodegen extends CodegenBase<ReactQueryFetcherCodegenOptions> {
  private readonly packageName: string;
  readonly #outputDir: OutputDir;

  constructor(opts: ReactQueryFetcherCodegenOptions) {
    super(opts);
    this.#outputDir = new OutputDir(this.options.outputDir);
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
    const operationFilePath = `use-${getOperationFilePath(operationDirPath, args.operation)}`;
    const functionName = camelCase(args.operation.operationId);
    const pascalFunctionName = pascalCase(args.operation.operationId);
    const operationIndexImportPath = path.relative(
      this.#outputDir.resolveDir('index.ts'),
      this.#outputDir.resolve(operationFilePath)
    );

    this.#outputDir.createDirSync(operationDirPath);

    const sourceCode = isQuery(args.operationMethod)
      ? templateDir.render('query-operation.ts.mustache', {
          functionName,
          pascalFunctionName,
          importPath: this.packageName,
        })
      : templateDir.render('mutation-operation.ts.mustache', {
          functionName,
          pascalFunctionName,
          importPath: this.packageName,
        });

    this.#outputDir.writeFileSync(`${operationFilePath}.ts`, sourceCode);
    this.#outputDir.formatSync(`${operationFilePath}.ts`);

    this.#outputDir.appendFileSync(
      'index.ts',
      templateDir.render('index-export-statement.ts.mustache', {
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
