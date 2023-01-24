import LaunchTemplateContainer from '../LaunchTemplateContainer';
import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-query', () => ({
  useQuery: () => ({ data: {description: 'mocked desc'}, isLoading: false, error: undefined })
}));

describe('LaunchTemplateContainer', () => {
  it('should render with sorted data', () => {
    const data = [{id: 2, name: 'John', version: 1}, {id: 1, name: 'Mary', version: 3}, {id: 3, name: 'Mike', version: 2}];
    const search = '';
    const selectedLaunchTemplateId = 3;
    const setLaunchTemplate = jest.fn();
    const component = renderer.create(
      <LaunchTemplateContainer
        data={data}
        search={search}
        selectedLaunchTemplateId={selectedLaunchTemplateId}
        setLaunchTemplate={setLaunchTemplate} />
  );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name))
    expect(data).toEqual(expect.arrayContaining(sortedData));
  });
});
