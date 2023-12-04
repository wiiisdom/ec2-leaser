import { useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import { UserContext, UserType } from '@/contexts/UserContext';
import { getUserInfo } from '@/api';

const App = () => {
  const [user, setUser] = useState<UserType>();

  const getSession = async () => {
    const token = localStorage.getItem('session');
    if (token) {
      const userInfo = await getUserInfo(token);
      if (userInfo) {
        setUser(userInfo);
      }
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('session', token);
      window.location.replace(window.location.origin);
    }
  }, []);

  if (user) {
    return (
      <UserContext.Provider value={user}>
        <MainScreen />
      </UserContext.Provider>
    );
  } else {
    return <LoginScreen />;
  }
};

export default App;
