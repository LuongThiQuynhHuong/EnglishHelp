import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { router } from 'expo-router';
import ReviewSessionScreen from '@/screens/review/ReviewSessionScreen';
import ReviewResultsScreen from '@/screens/review/ReviewResultsScreen';
import { useReviewSession } from '@/hooks/useReviewSession';
import i18n from '@/i18n';

jest.mock('@/hooks/useReviewSession', () => ({ useReviewSession: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

it('hides the target word and sends answer and navigation actions to session state', async () => {
  const setAnswer = jest.fn();
  const moveTo = jest.fn();
  const skip = jest.fn();
  jest.mocked(useReviewSession).mockReturnValue({
    session: { id: 'session', mode: 'group', questions: [
      { id: 'a', userId: 'user-a', wordClass: null, ipa: null, word: 'apple', vietnameseMeaning: 'quả táo', englishMeaning: 'A round fruit', imageUrl: null, createdAt: '2026-01-01', updatedAt: '2026-01-01', reviewCount: 0, correctCount: 0, incorrectCount: 0, lastReviewedAt: null },
      { id: 'b', userId: 'user-a', wordClass: null, ipa: null, word: 'banana', vietnameseMeaning: 'quả chuối', englishMeaning: 'A yellow fruit', imageUrl: null, createdAt: '2026-01-02', updatedAt: '2026-01-02', reviewCount: 0, correctCount: 0, incorrectCount: 0, lastReviewedAt: null },
    ], answers: {}, currentIndex: 0 },
    result: null, submitting: false, start: jest.fn(), setAnswer, moveTo, skip, submit: jest.fn(),
  });
  const screen = await render(<I18nextProvider i18n={i18n}><ReviewSessionScreen /></I18nextProvider>);
  expect(screen.queryByText('apple')).toBeNull();
  expect(screen.getByText('quả táo')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Your answer'), 'apple');
  await fireEvent.press(screen.getByLabelText('Next'));
  await fireEvent.press(screen.getByLabelText('Skip'));
  await fireEvent.press(screen.getByLabelText('Word 2, not visited'));
  expect(setAnswer).toHaveBeenCalledWith('apple');
  expect(moveTo).toHaveBeenCalledWith(1);
  expect(skip).toHaveBeenCalledTimes(1);
  expect(moveTo).toHaveBeenCalledWith(1);
});

it('shows skipped words in the incorrect answers list as unanswered', async () => {
  const vocabulary = { id: 'a', userId: 'user-a', wordClass: null, ipa: null, word: 'apple', vietnameseMeaning: 'quả táo', englishMeaning: 'A round fruit', imageUrl: null, createdAt: '2026-01-01', updatedAt: '2026-01-01', reviewCount: 0, correctCount: 0, incorrectCount: 0, lastReviewedAt: null };
  jest.mocked(useReviewSession).mockReturnValue({
    session: null,
    result: { total: 1, correct: 0, incorrect: 1, skipped: 1, percentage: 0, answers: [{ vocabulary, answer: '', status: 'skipped' }] },
    submitting: false, start: jest.fn(), setAnswer: jest.fn(), moveTo: jest.fn(), skip: jest.fn(), submit: jest.fn(),
  });
  const screen = await render(<I18nextProvider i18n={i18n}><ReviewResultsScreen /></I18nextProvider>);
  expect(screen.getByText('Correct word: apple')).toBeTruthy();
  expect(screen.getByText('Your answer: Unanswered')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Open details for apple'));
  expect(router.push).toHaveBeenCalledWith({ pathname: '/vocabulary/[id]', params: { id: 'a' } });
});
