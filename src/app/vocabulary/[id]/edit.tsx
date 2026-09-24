import { useLocalSearchParams } from 'expo-router';
import VocabularyFormScreen from '@/screens/vocabulary/VocabularyFormScreen';

export default function EditVocabularyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VocabularyFormScreen id={id} />;
}
