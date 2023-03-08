import { API } from 'aws-amplify';

export const fetchList = () => API.get('main', '/list');
export const fetchDescription = id =>
  API.post('main', '/description', {
    body: {
      instanceId: id
    }
  });

export const fetchPolicy = {
  cacheTime: 5 * 60 * 1000,
  retry: 2,
  staleTime: 5 * 59 * 1000,
  refetchOnWindowFocus: false
};
