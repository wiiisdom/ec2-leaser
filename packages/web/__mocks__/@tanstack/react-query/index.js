export const useQuery = query => {
  const name = query[0];
  if (name === 'launchTemplates') {
    return {
      data: [
        { id: 1, name: 'imageA' },
        { id: 2, name: 'imageB' }
      ],
      isLoading: false
    };
  }
  if (name === 'template') {
    return {
      data: { description: 'mocked desc' },
      isLoading: false,
      error: undefined
    };
  }
  throw new Error('no query found in mocked react-query module');
};
