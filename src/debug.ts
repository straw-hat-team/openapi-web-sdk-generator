import debug from 'debug';

export function createDebugger(...scope: string[]) {
  const namespace = ['@straw-hat/openapi-web-sdk-generator', ...scope].join(':');
  return debug(namespace);
}
