import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import i18n from '@/i18n';
import { router } from 'expo-router';

let mockBottomInset = 24;
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, Tabs: () => null }));
jest.mock('@/components/common/AppIcon', () => ({ AppIcon: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: mockBottomInset }) }));

const props = { state: { index: 0, routes: [{ key: 'home', name: 'index' }, { key: 'review', name: 'review' }, { key: 'settings', name: 'settings' }, { key: 'profile', name: 'profile' }] }, navigation: { navigate: jest.fn() } };

it('uses the center Add action and navigates to Profile as a tab', async () => {
  mockBottomInset = 24;
  const screen = await render(<I18nextProvider i18n={i18n}><BottomNavigation {...(props as unknown as Parameters<typeof BottomNavigation>[0])} /></I18nextProvider>);
  await fireEvent.press(screen.getByLabelText('Add New Word'));
  expect(router.push).toHaveBeenCalledWith('/vocabulary/new');
  await fireEvent.press(screen.getByLabelText('Profile'));
  expect(props.navigation.navigate).toHaveBeenCalledWith('profile');
  const barStyle = StyleSheet.flatten(screen.getByTestId('bottom-navigation').props.style);
  expect(barStyle).toMatchObject({ minHeight: 88, paddingBottom: 24 });
});

it.each([0, 24, 34, 48])('adds a %d-point gesture or system-navigation inset to the tab bar height', async (bottom) => {
  mockBottomInset = bottom;
  const screen = await render(<I18nextProvider i18n={i18n}><BottomNavigation {...(props as unknown as Parameters<typeof BottomNavigation>[0])} /></I18nextProvider>);
  const barStyle = StyleSheet.flatten(screen.getByTestId('bottom-navigation').props.style);
  expect(barStyle).toMatchObject({ minHeight: 64 + bottom, paddingBottom: bottom });
});
