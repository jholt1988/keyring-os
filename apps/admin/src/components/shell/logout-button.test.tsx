import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from './logout-button';

const logout = vi.fn();
vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ logout }),
}));

describe('LogoutButton', () => {
  it('calls logout() on click', async () => {
    logout.mockResolvedValue(undefined);
    render(<LogoutButton collapsed={false} />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it('renders the tooltip label only when collapsed', () => {
    const { rerender } = render(<LogoutButton collapsed={false} />);
    expect(screen.queryByText('Sign out')).toBeNull();

    rerender(<LogoutButton collapsed />);
    expect(screen.queryByText('Sign out')).not.toBeNull();
  });
});
