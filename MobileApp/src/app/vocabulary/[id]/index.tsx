import { useLocalSearchParams } from 'expo-router';
import VocabularyDetailScreen from '@/screens/vocabulary/VocabularyDetailScreen';

export default function VocabularyDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VocabularyDetailScreen id={id} />;
}
