import Cookies from 'js-cookie';
import { useEffect } from 'react';

export default function Logout() {
  useEffect(() => {
    logout();
  }, []);

  function logout() {
    Cookies.remove('loggedin');
    window.location.href = '/';
  }

  return <></>;
}
