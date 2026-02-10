import { createRequestListener } from '@react-router/node';
import type { ServerBuild } from 'react-router';

let build: ServerBuild;

try {
  // Prefer the production build output when it exists.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  build = require('../build/server/index.js');
} catch (error) {
  // Fallback for environments that can resolve the virtual module.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  build = require('virtual:react-router/server-build');
}

export default createRequestListener({
  build,
  mode: process.env.NODE_ENV,
});
