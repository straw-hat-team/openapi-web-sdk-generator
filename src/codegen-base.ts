import { OpenAPIV3 } from 'openapi-types';

export abstract class CodegenBase<Config = unknown> {
  #document: OpenAPIV3.Document | undefined = undefined;
  readonly config: Config;

  protected constructor(opts: Config) {
    this.config = opts;
  }

  get document(): OpenAPIV3.Document {
    return this.#document!;
  }

  setDocument(document: OpenAPIV3.Document) {
    this.#document = document;
    return this;
  }

  abstract generate(): Promise<void>;
}
