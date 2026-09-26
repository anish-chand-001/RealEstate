import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from './Footer';

/**
 * PublicLayout — wraps public pages with Navbar + Footer.
 * Renders child routes via <Outlet />.
 */
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
