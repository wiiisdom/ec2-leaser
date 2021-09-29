import { Auth, Hub } from 'aws-amplify';
import { useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

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
  return (
    <QueryClientProvider client={queryClient}>
      {!user ? <LoginScreen /> : <MainScreen user={user} />}
    </QueryClientProvider>
  );
};

export default App;