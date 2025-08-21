import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MapPin, CreditCard as Edit3, TrendingUp, Car } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthScreen } from '@/components/AuthScreen';

export default function StationsScreen() {
  const { 
    user, 
    loading, 
    selectedVehicle, 
    stations, 
    updateStationName, 
    getVehicleStats 
  } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!selectedVehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Car size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhum veículo selecionado</Text>
          <Text style={styles.emptySubtitle}>
            Selecione um veículo para ver os postos utilizados.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getVehicleStats();

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
              try {
                await updateStationName(stationId, newName.trim());
                Alert.alert('Sucesso', 'Nome do posto atualizado!');
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível atualizar o posto.');
              }
            }
          }
        }
      ],
      'plain-text',
      currentName
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MapPin size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Postos</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {selectedVehicle.name} • {selectedVehicle.plate}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stats.stationAverages.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum posto registrado</Text>
            <Text style={styles.emptySubtitle}>
              Os postos aparecerão aqui conforme você registra abastecimentos.
            </Text>
          </View>
        ) : (
          <View style={styles.stationsList}>
            <Text style={styles.totalStations}>
              {stats.stationAverages.length} posto{stats.stationAverages.length !== 1 ? 's' : ''} utilizado{stats.stationAverages.length !== 1 ? 's' : ''}
            </Text>
            
            {stats.stationAverages.map((station, index) => (
              <View key={station.stationId} style={styles.stationCard}>
                <View style={styles.stationHeader}>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.stationName}</Text>
                    <View style={styles.stationRank}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditStation(station.stationId, station.stationName)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.stationStats}>
                  <View style={styles.mainStat}>
                    <TrendingUp size={20} color="#10B981" />
                    <Text style={styles.averageValue}>{station.average.toFixed(1)} km/L</Text>
                  </View>

                  <View style={styles.detailStats}>
                    <View style={styles.detailStat}>
                      <Text style={styles.detailLabel}>Abastecimentos</Text>
                      <Text style={styles.detailValue}>{station.refuelCount}</Text>
                    </View>
                    <View style={styles.detailStat}>
                      <Text style={styles.detailLabel}>Km rodados</Text>
                      <Text style={styles.detailValue}>{station.totalKm.toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailStat}>
                      <Text style={styles.detailLabel}>Total litros</Text>
                      <Text style={styles.detailValue}>{station.totalLiters.toFixed(1)}L</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  stationsList: {
    gap: 12,
  },
  totalStations: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  stationRank: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  stationStats: {
    gap: 12,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
  },
  averageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailStat: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});