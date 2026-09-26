import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { colors, dimensions } from '@/theme/tokens';
import i18n from '@/i18n';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));
jest.mock('@/components/common/AppIcon', () => ({ AppIcon: () => null }));

it('uses shared header dimensions and exposes centered child-screen actions', async () => {
  const edit = jest.fn(); const remove = jest.fn();
  const screen = await render(<I18nextProvider i18n={i18n}><AppHeader title="Word" actions={[{ icon: 'review', label: 'Edit', onPress: edit }, { icon: 'delete', label: 'Delete', onPress: remove }]} /></I18nextProvider>);
  const style = StyleSheet.flatten(screen.getByTestId('app-header').props.style);
  expect(style).toMatchObject({ height: dimensions.headerHeight, backgroundColor: colors.primary, alignItems: 'center' });
  expect(screen.getByText('Word').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ textAlign: 'center' })]));
  await fireEvent.press(screen.getByLabelText('Edit'));
  await fireEvent.press(screen.getByLabelText('Delete'));
  expect(edit).toHaveBeenCalledTimes(1); expect(remove).toHaveBeenCalledTimes(1);
});

it('supports icon-free headers for Review, Settings, and Profile tabs', async () => {
  const screen = await render(<I18nextProvider i18n={i18n}><AppHeader title="Settings" leading="none" /></I18nextProvider>);
  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.queryByLabelText('Back')).toBeNull();
  expect(screen.queryByLabelText('Menu')).toBeNull();
});
