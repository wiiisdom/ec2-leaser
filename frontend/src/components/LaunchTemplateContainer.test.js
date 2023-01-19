import LaunchTemplateContainer from './LaunchTemplateContainer';
import React from 'react';
import renderer from 'react-test-renderer';

describe('LaunchTemplateContainer', () => {
  it('should render with sorted data', () => {
    const data = [{id: 2, name: 'John', version: 1}, {id: 1, name: 'Mary', version: 3}, {id: 3, name: 'Mike', version: 2}];
    const component = renderer.create(<LaunchTemplateContainer data={data} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(tree.props.data).toEqual(data.sort((a, b) => a.name - b.name));
    expect(tree.props.data).toBeSorted((a, b) => a.name - b.name);
  });
});

