import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Settings, Trash2, CreditCard as Edit3, MapPin, Info, Shield } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function SettingsScreen() {
  const { vehicle, stations, refuels, updateStation, clearAllData, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  const handleEditStation = (stationId: string, currentName: string) => {
    Alert.prompt(
      'Editar Posto',
      'Digite o novo nome do posto:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async (newName) => {
            if (newName && newName.trim() !== currentName) {
              await updateStation(stationId, newName.trim());
              Alert.alert('Sucesso', 'Nome do posto atualizado!');
            }
          }
        }
      ],
      'plain-text',
      currentName
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Excluir todos os dados',
      'Esta ação irá remover permanentemente:\n\n• Dados do veículo\n• Todos os abastecimentos\n• Postos salvos\n\nEsta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Dados removidos', 'Todos os dados foram excluídos com sucesso.');
          }
        }
      ]
    );
  };

  const getRefuelCountByStation = (stationId: string) => {
    return refuels.filter(refuel => refuel.stationId === stationId).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Settings size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do App</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Info size={20} color="#3B82F6" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>MM minha média</Text>
                <Text style={styles.infoSubtitle}>Controle de consumo de combustível</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        {vehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{refuels.length}</Text>
                <Text style={styles.statLabel}>Abastecimentos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stations.length}</Text>
                <Text style={styles.statLabel}>Postos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stations Management */}
        {stations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gerenciar Postos</Text>
            <View style={styles.stationsCard}>
              {stations.map((station) => (
                <View key={station.id} style={styles.stationItem}>
                  <View style={styles.stationInfo}>
                    <MapPin size={16} color="#6B7280" />
                    <View style={styles.stationText}>
                      <Text style={styles.stationName}>{station.name}</Text>
                      <Text style={styles.stationCount}>
                        {getRefuelCountByStation(station.id)} abastecimento(s)
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.editStationButton}
                    onPress={() => handleEditStation(station.id, station.name)}
                  >
                    <Edit3 size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar Dados</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.dangerButtonText}>Excluir Todos os Dados</Text>
          </TouchableOpacity>
          <Text style={styles.dangerWarning}>
            Esta ação removerá permanentemente todos os seus dados.
          </Text>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          <View style={styles.privacyCard}>
            <View style={styles.privacyItem}>
              <Shield size={20} color="#10B981" />
              <View style={styles.privacyText}>
                <Text style={styles.privacyTitle}>Dados locais</Text>
                <Text style={styles.privacySubtitle}>
                  Todos os seus dados são armazenados localmente no seu dispositivo e não são enviados para servidores externos.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  stationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationText: {
    marginLeft: 12,
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  stationCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editStationButton: {
    padding: 8,
  },
  dangerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerWarning: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  privacyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyText: {
    marginLeft: 12,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  privacySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});