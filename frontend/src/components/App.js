import { Auth, Hub } from 'aws-amplify';
import { useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';

const App = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      // data contains {id, email, name, token}
      switch (event) {
        case 'signIn':
          setUser(data);
          break;
        case 'signOut':
          setUser(null);
          break;
        default:
          console.log(event);
      }
    });

    Auth.currentAuthenticatedUser()
      .then(data => setUser(data))
      .catch(() => console.log('Not signed in'));
  }, []);
  console.log(user)

  return !user ? <LoginScreen /> : <MainScreen user={user} />;
};

export default App;
