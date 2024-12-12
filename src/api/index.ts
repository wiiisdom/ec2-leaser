const FIVE_MINUTES = 5;
const SIXTY_SECONDS = 60;
const FIFTY__NINE_SECONDS = 59;
const ONE_SECOND = 1000;

export const fetchPolicy = {
  cacheTime: FIVE_MINUTES * SIXTY_SECONDS * ONE_SECOND,
  retry: 2,
  staleTime: FIVE_MINUTES * FIFTY__NINE_SECONDS * ONE_SECOND,
  refetchOnWindowFocus: false
};

export const callApi = async <T>(
  path: string,
  method = 'GET',
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  body?: any
): Promise<T> => {
  const response = await fetch(path, {
    method,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }
  return response.json();
};
