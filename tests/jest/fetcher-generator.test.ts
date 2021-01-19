import { prepareTest } from './support-files';
import { FetcherCodegen } from '../../src/generators/fetcher';

describe('fetcher generator', () => {
  test('generates the types.ts file', async () => {
    await prepareTest(['generating-types'], async ({ tmpDir, generator }) => {
      generator.addGenerator(new FetcherCodegen(generator));
      await generator.generate();
      expect(tmpDir.exists('types.ts')).toBeTruthy();
    });
  });
});
