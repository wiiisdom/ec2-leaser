import LaunchTemplateContainer from './LaunchTemplateContainer';
import React from 'react';
import renderer from 'react-test-renderer';

// const MockData = {};
jest.mock('react-query', () => ({
  useQuery: jest.fn().mockReturnValue(({ data: {description: "mocked desc"}, isLoading: false ,error:{} }))
}));


describe('LaunchTemplateContainer', () => {
  it('should render with sorted data', () => {
    const data = [{id: 2, name: 'John', version: 1}, {id: 1, name: 'Mary', version: 3}, {id: 3, name: 'Mike', version: 2}];
    
    const search = 'Mike';
    const selectedLaunchTemplateId = 3;
    const setLaunchTemplate = jest.fn();
    const component = renderer.create(
      <LaunchTemplateContainer data={data} search={search} selectedLaunchTemplateId={selectedLaunchTemplateId} setLaunchTemplate={setLaunchTemplate} />
  );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(tree.props.data).toEqual(expect.arrayContaining(data.sort((a, b) => a.name.localeCompare(b.name))));
  });
});

