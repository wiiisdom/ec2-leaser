import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import LaunchTemplateContainer from '../src/components/LaunchTemplateContainer';

import { describe, vi, beforeEach, it, expect } from 'vitest';

vi.mock('react-query', () => ({
  useQuery: () => ({
    data: { description: 'mocked desc' },
    isLoading: false,
    error: undefined
  })
}));

describe('LaunchTemplateContainer', () => {
  let data;
  let search;
  let selectedLaunchTemplateId;
  let setLaunchTemplate;
  let component;

  beforeEach(() => {
    data = [
      { id: 1, name: 'Template A' },
      { id: 2, name: 'Template B' },
      { id: 3, name: 'Template C' }
    ];
    search = '';
    selectedLaunchTemplateId = 1;
    setLaunchTemplate = vi.fn();
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
    expect(setLaunchTemplate).toHaveBeenCalledWith({
      id: 2,
      name: 'Template B'
    });
  });

  it('should render with sorted data', () => {
    const sortedData = data.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );
    const props = {
      data: sortedData,
      search: '',
      selectedLaunchTemplateId: null,
      setLaunchTemplate: vi.fn()
    };
    cleanup();
    const { getAllByTestId } = render(<LaunchTemplateContainer {...props} />);
    const expectedOrder = sortedData.map(template => template.name);
    const displayedOrder = getAllByTestId('template-name').map(
      node => node.textContent
    );

    expect(displayedOrder).toEqual(expectedOrder);
  });
});
