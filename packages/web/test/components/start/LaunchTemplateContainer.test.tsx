import {
  render,
  fireEvent,
  cleanup,
  RenderResult
} from '@testing-library/react';
import LaunchTemplateContainer from '../../../src/components/start/LaunchTemplateContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { describe, vi, beforeEach, it, expect } from 'vitest';
import { LaunchTemplateType } from '../../../src/models/LaunchTemplate';

const queryClient = new QueryClient();

describe('LaunchTemplateContainer', () => {
  let data: LaunchTemplateType[];
  let search: string;
  let selectedLaunchTemplateId: string;
  let setLaunchTemplate: Function;
  let component: RenderResult;

  beforeEach(() => {
    data = [
      { id: '1', name: 'Template A' },
      { id: '2', name: 'Template B' },
      { id: '3', name: 'Template C' }
    ];
    search = '';
    selectedLaunchTemplateId = '1';
    setLaunchTemplate = vi.fn();
    component = render(
      <QueryClientProvider client={queryClient}>
        <LaunchTemplateContainer
          data={data}
          search={search}
          selectedLaunchTemplateId={selectedLaunchTemplateId}
          setLaunchTemplate={setLaunchTemplate}
        />
      </QueryClientProvider>
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
      <QueryClientProvider client={queryClient}>
        <LaunchTemplateContainer
          data={data}
          search={search}
          selectedLaunchTemplateId={selectedLaunchTemplateId}
          setLaunchTemplate={setLaunchTemplate}
        />
      </QueryClientProvider>
    );

    expect(getByText('Template A')).toBeInTheDocument();
    expect(queryByText('Template B')).not.toBeInTheDocument();
    expect(queryByText('Template C')).not.toBeInTheDocument();
  });

  it('should call setLaunchTemplate when a template is clicked', () => {
    const { getByText } = component;
    fireEvent.click(getByText('Template B'));
    expect(setLaunchTemplate).toHaveBeenCalledWith({
      id: '2',
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
    const { getAllByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <LaunchTemplateContainer {...props} />
      </QueryClientProvider>
    );
    const expectedOrder = sortedData.map(template => template.name);
    const displayedOrder = getAllByTestId('template-name').map(
      node => node.textContent
    );

    expect(displayedOrder).toEqual(expectedOrder);
  });
});
