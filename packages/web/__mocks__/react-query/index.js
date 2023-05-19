export const useQuery = query => {
  if (query === 'launchTemplates') {
    return {
      data: [
        { id: 1, name: 'imageA' },
        { id: 2, name: 'imageB' }
      ],
      isLoading: false
    };
  }
  if (Array.isArray(query) && query[0] === 'template') {
    return {
      data: { description: 'mocked desc' },
      isLoading: false,
      error: undefined
    };
  }
  throw new Error('no query found in mocked react-query module');
};
