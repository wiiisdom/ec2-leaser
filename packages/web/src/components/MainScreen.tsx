import Header from './Header';

import { UserType } from '../models/User';
import MainContent from './MainContent';

const MainScreen = ({ user }: { user: UserType }) => {
  return (
    <>
      <Header />
      <MainContent user={user} />
    </>
  );
};

export default MainScreen;
