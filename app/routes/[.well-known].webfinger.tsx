export const loader = async () => {
  const body = {
    subject: 'acct:chris@pond.design',
    aliases: [
      'https://mstdn.social/@ponddesign',
      'https://mstdn.social/users/ponddesign',
    ],
    links: [
      {
        rel: 'http://webfinger.net/rel/profile-page',
        type: 'text/html',
        href: 'https://mstdn.social/@ponddesign',
      },
      {
        rel: 'self',
        type: 'application/activity+json',
        href: 'https://mstdn.social/users/ponddesign',
      },
      {
        rel: 'http://ostatus.org/schema/1.0/subscribe',
        template: 'https://mstdn.social/authorize_interaction?uri={uri}',
      },
    ],
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/jrd+json; charset=utf-8',
    },
  });
};
