import { prepareTest } from './support-files';
import { ReactQueryFetcherCodegen, FetcherCodegen } from '../../src/generators';

describe('Generators', () => {
  test('fetcher', async () => {
    await prepareTest(['fetcher'], async ({ tmpDir, generator }) => {
      generator.addGenerator(
        new FetcherCodegen({
          outputDir: tmpDir.path,
        })
      );
      await generator.generate();
      expect(tmpDir.exists('types.ts')).toBeTruthy();
    });
  });

  test('react-query-fetcher', async () => {
    await prepareTest(['react-query-fetcher'], async ({ tmpDir, generator }) => {
      generator.addGenerator(
        new ReactQueryFetcherCodegen({
          outputDir: tmpDir.path,
          packageName: '@my-sdk/pepeg',
        })
      );
      await generator.generate();
      expect(tmpDir.exists('index.ts')).toBeTruthy();
      expect(tmpDir.exists('use-place-order.ts')).toBeTruthy();
    });
  });
});
