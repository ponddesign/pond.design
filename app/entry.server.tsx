import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';

/** Renders pages on Cloudflare Workers (web streams, not Node streams). */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  let shellRendered = false;
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Errors before the shell renders reject above and are logged by
        // React Router; only log the ones that happen while streaming.
        if (shellRendered) console.error(error);
      },
    },
  );
  shellRendered = true;

  // Crawlers and pre-rendering get the whole page at once.
  const userAgent = request.headers.get('user-agent');
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode)
    await body.allReady;

  responseHeaders.set('Content-Type', 'text/html');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
