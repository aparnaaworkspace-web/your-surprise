import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ChapterPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.star}>✦</Text>
      <Text style={styles.title}>Chapter {id}</Text>
      <Text style={styles.subtitle}>This star is ready for its story.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  star: {
    color: '#ffd85d',
    fontSize: 54,
    textShadowColor: '#ffd85d',
    textShadowRadius: 20,
  },
  title: {
    color: '#ffffff',
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    color: '#9eb8d6',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
