import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Fuel } from 'lucide-react-native';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Fuel size={48} color="#3B82F6" />
      <Text style={styles.title}>MM minha média</Text>
      <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      <Text style={styles.subtitle}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});