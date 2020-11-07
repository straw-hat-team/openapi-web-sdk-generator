import 'dotenv/config';

import path, { join } from 'path';
import { Codegen } from './codegen';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'openapi.json');
const TMP_DIR = path.join(process.cwd(), 'src', '.tmp');

export async function main() {
  const config = Codegen.readConfig(CONFIG_PATH);

  const codegen = new Codegen({
    config: config,
    paths: {
      outputDir: TMP_DIR,
      httpClient: join(__dirname, '..', 'src', 'client', 'http-client.ts'),
    },
  });

  codegen.generate();
}

main().catch(console.log);
