import prettierConfig from '@straw-hat/prettier-config';
import prettier from 'prettier';

export function format(source: string) {
  return prettier.format(source, {
    ...prettierConfig,
    parser: 'typescript',
  });
}
