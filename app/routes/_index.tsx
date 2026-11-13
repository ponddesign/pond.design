import type { MetaFunction } from 'react-router';
import Footer from '../components/Footer';
import Header from '../components/Header';

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
