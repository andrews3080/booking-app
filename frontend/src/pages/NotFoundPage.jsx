// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1><span aria-hidden="true">🧭</span> Page not found</h1>
        <p>That address doesn't exist.</p>
      </header>
      <Link to="/" className="btn">Back to booking</Link>
    </div>
  );
}

export default NotFoundPage;