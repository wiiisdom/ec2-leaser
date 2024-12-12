import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StartResult from '@/components/start/StartResult';

it('should render privateIp if starting is false', async () => {
  render(
    <StartResult
      starting={false}
      error=""
      instanceInfo={{
        instanceId: 'instanceId',
        privateIp: 'privateIp'
      }}
    />
  );
  expect(screen.queryByText('privateIp')).toBeInTheDocument();
});

it('should not render privateIp if starting is true', async () => {
  render(<StartResult starting={true} error="" instanceInfo={undefined} />);
  expect(screen.queryByText('privateIp')).not.toBeInTheDocument();
});
