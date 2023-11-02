import { API } from 'aws-amplify';

const FIVE_MINUTES = 5;
const SIXTY_SECONDS = 60;
const FIFTY__NINE_SECONDS = 59;
const ONE_SECOND = 1000;
export const fetchList = () => API.get('main', '/list', {});
export const fetchDescription = (id: string) =>
  API.post('main', '/description', {
    body: {
      instanceId: id
    }
  });

export const fetchPolicy = {
  cacheTime: FIVE_MINUTES * SIXTY_SECONDS * ONE_SECOND,
  retry: 2,
  staleTime: FIVE_MINUTES * FIFTY__NINE_SECONDS * ONE_SECOND,
  refetchOnWindowFocus: false
};
