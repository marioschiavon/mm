import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { History, Calendar, MapPin, Gauge, DollarSign, TrendingUp, Trash2, Car } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthScreen } from '@/components/AuthScreen';

export default function HistoryScreen() {
  const { 
    user, 
    loading, 
    selectedVehicle, 
    refuels, 
    deleteRefuel 
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
            Selecione um veículo para ver o histórico de abastecimentos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedRefuels = [...refuels].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDeleteRefuel = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este abastecimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteRefuel(id)
        }
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <History size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Histórico</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {selectedVehicle.name} • {selectedVehicle.plate}
        </Text>
      </View>

      {sortedRefuels.length === 0 ? (
        <View style={styles.emptyState}>
          <History size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhum abastecimento registrado</Text>
          <Text style={styles.emptySubtitle}>
            Comece registrando seus abastecimentos para acompanhar o consumo.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.totalRefuels}>
            {sortedRefuels.length} abastecimento{sortedRefuels.length !== 1 ? 's' : ''} registrado{sortedRefuels.length !== 1 ? 's' : ''}
          </Text>
          
          {sortedRefuels.map((refuel, index) => {
            const isFirst = index === 0;
            
            return (
              <View key={refuel.id} style={[styles.refuelCard, isFirst && styles.latestRefuel]}>
                <View style={styles.refuelHeader}>
                  <View style={styles.refuelDate}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.dateText}>{formatDate(refuel.date)}</Text>
                    {isFirst && <Text style={styles.latestBadge}>Mais recente</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRefuel(refuel.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.refuelInfo}>
                  <View style={styles.refuelItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.refuelItemText}>{refuel.stationName}</Text>
                  </View>

                  <View style={styles.refuelItem}>
                    <Gauge size={16} color="#6B7280" />
                    <Text style={styles.refuelItemText}>
                      {refuel.currentKm.toLocaleString()} km
                      {refuel.kmTraveled && refuel.kmTraveled > 0 && (
                        <Text style={styles.kmTraveled}> (+{refuel.kmTraveled} km)</Text>
                      )}
                    </Text>
                  </View>

                  <View style={styles.refuelMetrics}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>R$/L</Text>
                      <Text style={styles.metricValue}>{formatCurrency(refuel.pricePerLiter)}</Text>
                    </View>

                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Total</Text>
                      <Text style={styles.metricValue}>{formatCurrency(refuel.totalValue)}</Text>
                    </View>

                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Litros</Text>
                      <Text style={styles.metricValue}>{refuel.liters.toFixed(2)}L</Text>
                    </View>

                    {refuel.consumption && refuel.consumption > 0 && (
                      <View style={styles.consumptionItem}>
                        <TrendingUp size={16} color="#10B981" />
                        <Text style={styles.consumptionValue}>
                          {refuel.consumption.toFixed(2)} km/L
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  totalRefuels: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  refuelCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  latestRefuel: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  refuelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refuelDate: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  latestBadge: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 4,
  },
  refuelInfo: {
    gap: 8,
  },
  refuelItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refuelItemText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  kmTraveled: {
    color: '#10B981',
    fontWeight: '500',
  },
  refuelMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  consumptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  consumptionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
});