import { createRequestListener } from '@react-router/node';
import type { ServerBuild } from 'react-router';

let build: ServerBuild;

try {
  // Prefer the production build output when it exists.
  // @ts-expect-error - only present after `react-router build` has run
  build = (await import('../build/server/index.js')) as unknown as ServerBuild;
} catch (error) {
  // Fallback for environments that can resolve the virtual module.
  build = (await import(
    'virtual:react-router/server-build'
  )) as unknown as ServerBuild;
}

export default createRequestListener({
  build,
  mode: process.env.NODE_ENV,
});
