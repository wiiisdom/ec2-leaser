export const API = {
  get: (_apiName, path) => {
    if (path.includes('costcenters')) {
      return Promise.resolve([
        { name: 'cc1', description: 'cc1 desc' },
        { name: 'cc2', description: 'cc2 desc' }
      ]);
    }
    if (path.includes('schedules')) {
      return Promise.resolve([
        { name: 'lille-office-stop', description: 'desc' }
      ]);
    }

    throw new Error('no GET route found in mocked aws-amplify module');
  },
  post: (_apiName, path) => {
    if (path === backendRouting.supportCreate) {
      //return asyncFetch(getFixtures.supportTicket);
    }

    throw new Error('no POST route found in mocked aws-amplify module');
  },
  patch: () => {},
  cancel: () => true,
  isCancel: () => false
};

export const Auth = {
  signOut: () => {
    return new Promise(resolve => resolve());
  },
  federatedSignIn: () => {
    return new Promise(resolve => resolve());
  },
  currentAuthenticatedUser: () => {
    return new Promise(resolve => resolve());
  }
};
