// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import BookPage from './pages/BookPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ManageBookingPage from './pages/ManageBookingPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A route with no path is a "layout route": every route nested inside it
            renders inside <Layout />'s <Outlet /> */}
        <Route element={<Layout />}>
          <Route path="/" element={<BookPage />} />
          <Route path="/booking/:reference" element={<ConfirmationPage />} />
          <Route path="/manage" element={<ManageBookingPage />} />
          <Route path="*" element={<NotFoundPage />} />  {/* anything unmatched */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;