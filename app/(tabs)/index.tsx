import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Chrome as Home, TrendingUp, MapPin, Calendar, Fuel, Plus, Car } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthScreen } from '@/components/AuthScreen';
import { CustomHeader } from '@/components/CustomHeader';
import { SideMenuModal } from '@/components/SideMenuModal';

export default function DashboardScreen() {
  const { user, loading, selectedVehicle, getVehicleStats } = useApp();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

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
            Selecione um veículo na aba "Veículos" para ver o dashboard.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/vehicles')}
          >
            <Text style={styles.primaryButtonText}>Ir para Veículos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getVehicleStats();
  const hasEnoughData = stats.totalRefuels >= 2;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Dashboard" onMenuPress={() => setMenuVisible(true)} />
      <SideMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedVehicle && (
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleText}>
              {selectedVehicle.name} • {selectedVehicle.plate}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.quickAddButton}
          onPress={() => router.push('/refuels')}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.quickAddText}>Adicionar Abastecimento</Text>
        </TouchableOpacity>

        {!hasEnoughData ? (
          <View style={styles.insufficientDataCard}>
            <TrendingUp size={32} color="#F59E0B" />
            <Text style={styles.insufficientDataTitle}>Dados insuficientes</Text>
            <Text style={styles.insufficientDataText}>
              Cadastre pelo menos 2 abastecimentos para ver a média de consumo.
            </Text>
            <Text style={styles.currentRefuels}>
              Abastecimentos cadastrados: {stats.totalRefuels}
            </Text>
          </View>
        ) : (
          <>
            {/* Média Geral */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Média Geral</Text>
              <View style={styles.averageContainer}>
                <Text style={styles.averageValue}>{stats.generalAverage.toFixed(1)}</Text>
                <Text style={styles.averageUnit}>km/L</Text>
              </View>
              <Text style={styles.statsSubtitle}>
                {stats.totalKm.toLocaleString()} km • {stats.totalLiters.toFixed(1)}L
              </Text>
            </View>

            {/* Médias por Posto */}
            {stats.stationAverages.length > 0 && (
              <View style={styles.stationsCard}>
                <Text style={styles.cardTitle}>Médias por Posto</Text>
                {stats.stationAverages.map((station) => (
                  <View key={station.stationId} style={styles.stationItem}>
                    <View style={styles.stationInfo}>
                      <MapPin size={16} color="#6B7280" />
                      <View style={styles.stationText}>
                        <Text style={styles.stationName}>{station.stationName}</Text>
                        <Text style={styles.stationDetails}>
                          {station.refuelCount} abast. • {station.totalKm}km • {station.totalLiters.toFixed(1)}L
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.stationAverage}>{station.average.toFixed(1)} km/L</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Último Abastecimento */}
            {stats.lastRefuel && (
              <View style={styles.lastRefuelCard}>
                <Text style={styles.cardTitle}>Último Abastecimento</Text>
                <View style={styles.lastRefuelContent}>
                  <View style={styles.lastRefuelInfo}>
                    <View style={styles.lastRefuelItem}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.lastRefuelText}>
                        {stats.lastRefuel.date.toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    <View style={styles.lastRefuelItem}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.lastRefuelText}>
                        {stats.lastRefuel.stationName}
                      </Text>
                    </View>
                  </View>
                  {stats.lastRefuel.consumption && stats.lastRefuel.consumption > 0 && (
                    <View style={styles.lastRefuelConsumption}>
                      <Text style={styles.lastConsumptionValue}>
                        {stats.lastRefuel.consumption.toFixed(1)}
                      </Text>
                      <Text style={styles.lastConsumptionUnit}>km/L</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </>
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
  scrollView: {
    flex: 1,
  },
  vehicleInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickAddButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  insufficientDataCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insufficientDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
  insufficientDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 20,
  },
  currentRefuels: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  averageValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
  },
  averageUnit: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  stationsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationText: {
    marginLeft: 8,
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  stationDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  stationAverage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  lastRefuelCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lastRefuelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRefuelInfo: {
    flex: 1,
  },
  lastRefuelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastRefuelText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  lastRefuelConsumption: {
    alignItems: 'center',
  },
  lastConsumptionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  lastConsumptionUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
});