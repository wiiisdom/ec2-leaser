import { Auth, Hub } from 'aws-amplify';
import { useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';

const App = () => {
  const [user, setUser] = useState();
  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      // data contains {id, email, name, token}
      switch (event) {
        case 'signIn':
          setUser(data.name);
          break;
        case 'signOut':
          setUser(null);
          break;
        default:
          console.log(event);
      }
    });

    Auth.currentAuthenticatedUser()
      .then(user => setUser(user.name))
      .catch(() => console.log('Not signed in'));
  });
  if (!user) {
    return <LoginScreen />;
  } else {
    return <MainScreen user={user} />;
  }
};

export default App;
