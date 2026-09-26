import { FormField } from './FormField';

export function PasswordInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <FormField label={label} value={value} onChangeText={onChangeText} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" />;
}
