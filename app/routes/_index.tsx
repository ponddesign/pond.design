import type { MetaFunction } from '@remix-run/node';

import Header from '../components/Header';
import Footer from '../components/Footer';

export const meta: MetaFunction = () => {
  return [{ title: 'Pond Design' }];
};

export default function Index() {
  return (
    <div>
      <Header />
      <Footer />
    </div>
  );
}
