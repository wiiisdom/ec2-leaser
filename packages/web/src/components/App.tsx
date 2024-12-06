import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import { useSession } from 'next-auth/react';

const App = () => {
  const { status } = useSession();

  if (status === 'authenticated') {
    return <MainScreen />;
  } else {
    return <LoginScreen />;
  }
};

export default App;
