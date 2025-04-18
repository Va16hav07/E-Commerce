import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // Define paths where header and footer should be hidden
  const hideHeaderFooterPaths = ['/admin', '/rider'];
  
  // Check if the current path starts with any of the paths in hideHeaderFooterPaths
  const shouldHideHeaderFooter = hideHeaderFooterPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  return (
    <>
      {!shouldHideHeaderFooter && <Header />}
      <main>
        {children}
      </main>
      {!shouldHideHeaderFooter && <Footer />}
    </>
  );
}
