import React from 'react';

export type UserType = {
  userId: string;
  token: string;
};

const defaultValue: UserType = {
  userId: '',
  token: ''
};

export const UserContext = React.createContext<UserType>(defaultValue);

export const useUser = () => {
  return React.useContext(UserContext);
};
