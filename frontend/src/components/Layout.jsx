// src/components/Layout.jsx
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

function titleFor(path) {
  if (path === '/') return 'Book a slot';
  if (path === '/manage') return 'Manage booking';
  if (path.startsWith('/booking/')) return 'Booking confirmed';
  return 'Page not found';
}

function Layout() {
  const { pathname } = useLocation();

  // Update the browser tab title whenever the page changes.
  // The regex drops a trailing slash so "/manage/" counts as "/manage".
  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    document.title = `${titleFor(path)} | Office hours`;
  }, [pathname]);

  return (
    <>
      <nav className="topbar">
        <div className="topbar-inner">
          <span className="topbar-brand">Office hours</span>
          <div className="topbar-links">
            <NavLink to="/" end>Book</NavLink>
            <NavLink to="/manage">Manage booking</NavLink>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}

export default Layout;