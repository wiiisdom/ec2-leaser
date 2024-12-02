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

export const callApi = async (
  token: string,
  path: string,
  method: string = 'GET',
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  body?: any
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
): Promise<any> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }
  return response.json();
};

export const getUserInfo = async (token: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API}/session`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const { userId } = (await response.json()) as { userId: string };
  return {
    userId,
    token
  };
};
