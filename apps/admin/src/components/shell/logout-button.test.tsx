import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from './logout-button';

const logout = vi.fn();
let mockUser: { username?: string; email?: string; role?: string } | null;

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ user: mockUser, logout }),
}));

describe('LogoutButton', () => {
  it('renders nothing until the user is loaded', () => {
    mockUser = null;
    const { container } = render(<LogoutButton collapsed={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('surfaces the signed-in user name and email', () => {
    mockUser = { username: 'jordan', email: 'jordan@keyring.test', role: 'ADMIN' };
    render(<LogoutButton collapsed={false} />);
    expect(screen.getByText('jordan')).toBeTruthy();
    expect(screen.getByText('jordan@keyring.test')).toBeTruthy();
  });

  it('confirms before signing out', async () => {
    mockUser = { username: 'jordan', email: 'jordan@keyring.test', role: 'ADMIN' };
    logout.mockResolvedValue(undefined);
    render(<LogoutButton collapsed={false} />);

    // Opening the account control does NOT log out on its own.
    fireEvent.click(screen.getByLabelText('Account: jordan'));
    expect(logout).not.toHaveBeenCalled();

    // Confirming in the dialog triggers logout.
    fireEvent.click(screen.getByRole('button', { name: /^sign out$/i }));
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});
