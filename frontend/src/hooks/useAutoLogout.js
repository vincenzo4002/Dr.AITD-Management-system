import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const useAutoLogout = (timeout = 1800000) => { // 30 minutes = 1800000ms
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const logout = useCallback(() => {
    Cookies.remove('token');
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState(null, '', window.location.href);
    navigate('/login', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(logout, timeout);
  }, [logout, timeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    // Clear timer on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  return logout;
};

export default useAutoLogout;
