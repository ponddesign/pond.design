import androidChrome192x192 from '../assets/android-chrome-192x192.png';
import androidChrome512x512 from '../assets/android-chrome-512x512.png';
import { ColorPrimary700 } from '../design-tokens';

export const loader = () => {
  const content = JSON.stringify({
    name: 'Pond Design',
    short_name: 'Pond',
    start_url: '/',
    icons: [
      {
        src: androidChrome192x192,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: androidChrome512x512,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: ColorPrimary700,
    background_color: ColorPrimary700,
    display: 'standalone',
  });

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
