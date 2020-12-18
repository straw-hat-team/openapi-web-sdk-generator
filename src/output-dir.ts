import { createDebugger } from './debug';
import { Dir } from './dir';

export class OutputDir extends Dir {
  debug = createDebugger('out-dir');
}
