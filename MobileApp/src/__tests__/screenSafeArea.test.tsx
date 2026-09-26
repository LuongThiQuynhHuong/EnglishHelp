import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Screen, ScreenSafeAreaProvider } from '@/components/common/Screen';

jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));

it('includes the bottom device inset for ordinary stack screens', async () => {
  const screen = await render(<Screen><Text>Content</Text></Screen>);
  expect(screen.getByTestId('screen-safe-area').props.edges).toEqual(['top', 'bottom', 'left', 'right']);
});

it('lets tab screens delegate the bottom inset to the safe custom tab bar', async () => {
  const screen = await render(<ScreenSafeAreaProvider includeBottom={false}><Screen><Text>Content</Text></Screen></ScreenSafeAreaProvider>);
  expect(screen.getByTestId('screen-safe-area').props.edges).toEqual(['top', 'left', 'right']);
});

it('keeps a page header in its own green top safe area above light content', async () => {
  const screen = await render(<Screen header={<Text testID="header">Header</Text>}><Text>Content</Text></Screen>);
  expect(screen.getByTestId('screen-header-safe-area').props.edges).toEqual(['top', 'left', 'right']);
  expect(screen.getByTestId('screen-safe-area').props.edges).toEqual(['bottom', 'left', 'right']);
  expect(screen.getByTestId('header')).toBeTruthy();
  expect(screen.getByText('Content')).toBeTruthy();
});
