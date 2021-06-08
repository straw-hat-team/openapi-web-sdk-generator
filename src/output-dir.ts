import { Dir } from './dir';
import { createDebugger } from "./helpers";

export class OutputDir extends Dir {
  debug = createDebugger('out-dir');
}
