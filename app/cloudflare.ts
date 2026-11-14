import { createContext } from 'react-router';

/**
 * The Worker's bindings (`env`) and execution context, for loaders,
 * actions and middleware: `context.get(cloudflareContext)`.
 */
export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();
