import LaunchTemplateContainer from '../components/LaunchTemplateContainer';
import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-query', () => ({
  useQuery: () => ({ data: {description: 'mocked desc'}, isLoading: false, error: undefined })
}));

describe('LaunchTemplateContainer', () => {
  it('should render with sorted data', () => {
    const data = [{id: 1, name: 'Mary', version: 3}, {id: 2, name: 'John', version: 1}, {id: 3, name: 'Mike', version: 2}];
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name))
    const search = '';
    const selectedLaunchTemplateId = 3;
    const setLaunchTemplate = jest.fn();
    const component = renderer.create(
      <LaunchTemplateContainer
        data={sortedData}
        search={search}
        selectedLaunchTemplateId={selectedLaunchTemplateId}
        setLaunchTemplate={setLaunchTemplate} />
  );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(data).toEqual(expect.arrayContaining(sortedData));
  });
});
