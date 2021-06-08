import { prepareTest } from './support-files';
import ReactQueryFetcherCodegen from '../../src/generators/react-query-fetcher';
import FetcherCodegen from '../../src/generators/fetcher';

describe('Generators', () => {
  test('fetcher', async () => {
    await prepareTest(['fetcher'], async ({ tmpDir, openapiDocument }) => {
      const generator = new FetcherCodegen({
        outputDir: tmpDir.path,
      });
      generator.setDocument(openapiDocument);
      await generator.generate();
      expect(tmpDir.exists('types.ts')).toBeTruthy();
    });
  });

  test('react-query-fetcher', async () => {
    await prepareTest(['react-query-fetcher'], async ({ tmpDir, openapiDocument }) => {
      const generator = new ReactQueryFetcherCodegen({
        outputDir: tmpDir.path,
        packageName: '@my-sdk/pepeg',
      });
      generator.setDocument(openapiDocument);
      await generator.generate();
      expect(tmpDir.exists('index.ts')).toBeTruthy();
      expect(tmpDir.exists('use-place-order.ts')).toBeTruthy();
    });
  });
});
