import { fireEvent, render } from '@testing-library/react-native';
import { RemoteVocabularyImage } from '@/components/vocabulary/RemoteVocabularyImage';
import i18n from '@/i18n';

it('shows a placeholder when a remote image fails to load', async () => {
  const screen = await render(<RemoteVocabularyImage url="https://example.com/image" />);
  await fireEvent(screen.getByLabelText(i18n.t('vocabulary.imagePreview')), 'error');
  expect(await screen.findByText(i18n.t('vocabulary.imageUnavailable'))).toBeTruthy();
});
