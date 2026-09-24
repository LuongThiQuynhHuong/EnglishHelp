import { render } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';
import { useAuth } from '@/hooks/useAuth';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

jest.mock('@/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/providers/AppProviders', () => ({ AppProviders: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  function Stack({ children }: { children: React.ReactNode }) { return children; }
  Stack.Protected = function Protected({ guard, children }: { guard: boolean; children: React.ReactNode }) { return guard ? children : null; };
  Stack.Screen = function Screen({ name }: { name: string }) { return <Text>{name}</Text>; };
  return { Stack };
});

it('shows auth routes before sign in and protected app routes afterward', async () => {
  jest.mocked(useAuth).mockReturnValue({ isAuthenticated: false, isLoading: false } as ReturnType<typeof useAuth>);
  const screen = await render(<I18nextProvider i18n={i18n}><RootLayout /></I18nextProvider>);
  expect(screen.getByText('login')).toBeTruthy();
  expect(screen.getByText('signup')).toBeTruthy();
  expect(screen.queryByText('(tabs)')).toBeNull();
  jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false } as ReturnType<typeof useAuth>);
  await screen.rerender(<I18nextProvider i18n={i18n}><RootLayout /></I18nextProvider>);
  expect(screen.getByText('(tabs)')).toBeTruthy();
  expect(screen.queryByText('login')).toBeNull();
});
