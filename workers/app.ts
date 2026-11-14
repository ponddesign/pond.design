import { createRequestHandler, RouterContextProvider } from 'react-router';
import { cloudflareContext } from '../app/cloudflare';
import { withSecurityHeaders } from './headers';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    return withSecurityHeaders(await requestHandler(request, context));
  },
} satisfies ExportedHandler<Env>;
