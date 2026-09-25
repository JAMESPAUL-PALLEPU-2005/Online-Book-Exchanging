import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Interactive3DBook = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.data && event.data.type === 'AUTH_SUCCESS') {
        const user = event.data.user;
        if (onLoginSuccess) {
          onLoginSuccess(user);
        } else {
          navigate('/', { state: { userId: user ? user.id : localStorage.getItem('userId') } });
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [navigate, onLoginSuccess]);

  return (
    <div className="interactive-3d-book-wrapper">
      <iframe
        src="/interactive-3d-book.html"
        title="BookBridge - 3D Interactive Collector's Book"
        className="interactive-3d-book-iframe"
      />
    </div>
  );
};

export default Interactive3DBook;
