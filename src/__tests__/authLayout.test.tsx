import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthLayout } from '@/components/common/AuthLayout';

jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));

it('renders the complete text logo and keeps the footer inside the shared scrollable screen', async () => {
  const screen = await render(<AuthLayout footer={<Text>Sign Up</Text>}><Text>Form</Text></AuthLayout>);
  expect(screen.getByLabelText('English Helper')).toBeTruthy();
  expect(screen.getByText('English')).toBeTruthy();
  expect(screen.getByText('Help')).toBeTruthy();
  expect(screen.getByText('Sign Up')).toBeTruthy();
});
