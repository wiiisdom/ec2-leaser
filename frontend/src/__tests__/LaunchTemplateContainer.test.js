import LaunchTemplateContainer from '../components/LaunchTemplateContainer';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
jest.mock('react-query', () => ({
  useQuery: () => ({ data: {description: 'mocked desc'}, isLoading: false, error: undefined })
}));

describe('LaunchTemplateContainer', () => {
  let data;
  let search;
  let selectedLaunchTemplateId;
  let setLaunchTemplate;
  let component;

  beforeEach(() => {
      data = [
          { id: 1, name: 'Template A', version: 1 },
          { id: 2, name: 'Template B', version: 2 },
          { id: 3, name: 'Template C', version: 3 },
      ];
      search = '';
      selectedLaunchTemplateId = 1;
      setLaunchTemplate = jest.fn();
      component = render(
          <LaunchTemplateContainer
              data={data}
              search={search}
              selectedLaunchTemplateId={selectedLaunchTemplateId}
              setLaunchTemplate={setLaunchTemplate}
          />
      );
  });

  it('should render all launch templates', () => {
      const { getByText } = component;
      expect(getByText('Template A')).toBeInTheDocument();
      expect(getByText('Template B')).toBeInTheDocument();
      expect(getByText('Template C')).toBeInTheDocument();
  });

  it('should filter launch templates by search', () => {
      const { getByText, queryByText } = component;
      expect(getByText('Template A')).toBeInTheDocument();
      expect(getByText('Template B')).toBeInTheDocument();
      expect(getByText('Template C')).toBeInTheDocument();

      search = 'Template A';
      component.rerender(
          <LaunchTemplateContainer
              data={data}
              search={search}
              selectedLaunchTemplateId={selectedLaunchTemplateId}
              setLaunchTemplate={setLaunchTemplate}
          />
      );

      expect(getByText('Template A')).toBeInTheDocument();
      expect(queryByText('Template B')).not.toBeInTheDocument();
      expect(queryByText('Template C')).not.toBeInTheDocument();
  });

  it('should call setLaunchTemplate when a template is clicked', () => {
      const { getByText } = component;
      fireEvent.click(getByText('Template B'));
      expect(setLaunchTemplate).toHaveBeenCalledWith({"id": 2, "name": "Template B"});
  });

  it('should render with sorted data', () => {
    cleanup();
    const sortedData = [
      { id: 3, name: 'Template C' },
      { id: 2, name: 'Template B' },
      { id: 1, name: 'Template A' }
    ];
    const props = {
      data: sortedData,
      search: '',
      selectedLaunchTemplateId: null,
      setLaunchTemplate: jest.fn(),
    };
    const { getByText } = render(<LaunchTemplateContainer {...props} />);

    expect(getByText('Template C')).toBeInTheDocument();
    expect(getByText('Template B')).toBeInTheDocument();
    expect(getByText('Template A')).toBeInTheDocument();
  });
});
