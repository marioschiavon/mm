import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Plus, Calendar, MapPin, Gauge, DollarSign, TrendingUp, Trash2, Car } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthScreen } from '@/components/AuthScreen';

export default function RefuelsScreen() {
  const { 
    user, 
    loading, 
    selectedVehicle, 
    refuels, 
    stations, 
    addRefuel, 
    deleteRefuel 
  } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [currentKm, setCurrentKm] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [stationName, setStationName] = useState('');
  const [date, setDate] = useState(new Date());

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
            Selecione um veículo para registrar abastecimentos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedRefuels = [...refuels].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastRefuel = sortedRefuels[0];
  const minKm = lastRefuel ? lastRefuel.currentKm : selectedVehicle.initialKm;

  const resetForm = () => {
    setCurrentKm('');
    setPricePerLiter('');
    setTotalValue('');
    setStationName('');
    setDate(new Date());
    setShowForm(false);
  };

  const calculateLiters = () => {
    const priceValue = parseFloat(pricePerLiter.replace(',', '.'));
    const totalValueAmount = parseFloat(totalValue.replace(',', '.'));
    
    if (!isNaN(priceValue) && !isNaN(totalValueAmount) && priceValue > 0) {
      return totalValueAmount / priceValue;
    }
    return 0;
  };

  const calculatedLiters = calculateLiters();

  const handleSubmit = async () => {
    if (!currentKm.trim() || !pricePerLiter.trim() || !totalValue.trim() || !stationName.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const kmValue = parseInt(currentKm, 10);
    const priceValue = parseFloat(pricePerLiter.replace(',', '.'));
    const valueAmount = parseFloat(totalValue.replace(',', '.'));

    if (isNaN(kmValue) || kmValue <= minKm) {
      Alert.alert('Erro', `A quilometragem deve ser maior que ${minKm} km.`);
      return;
    }

    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Erro', 'O valor do litro deve ser um número válido.');
      return;
    }

    if (isNaN(valueAmount) || valueAmount <= 0) {
      Alert.alert('Erro', 'O valor total deve ser um número válido.');
      return;
    }

    const litersValue = valueAmount / priceValue;

    try {
      await addRefuel({
        vehicleId: selectedVehicle.id,
        date,
        currentKm: kmValue,
        liters: litersValue,
        pricePerLiter: priceValue,
        totalValue: valueAmount,
        stationName: stationName.trim(),
        stationId: '', // Will be set by the service
      });

      resetForm();
      Alert.alert('Sucesso', 'Abastecimento registrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar o abastecimento.');
    }
  };

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

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
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
          <Plus size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Abastecimentos</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Novo Abastecimento</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data</Text>
              <View style={styles.dateContainer}>
                <Calendar size={20} color="#6B7280" />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </View>
              <Text style={styles.hint}>Data atual será registrada</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quilometragem Atual</Text>
              <View style={styles.inputContainer}>
                <Gauge size={20} color="#6B7280" />
                <TextInput
                  style={styles.inputWithIcon}
                  value={currentKm}
                  onChangeText={setCurrentKm}
                  placeholder={`Maior que ${minKm} km`}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor do Litro (R$)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#6B7280" />
                <TextInput
                  style={styles.inputWithIcon}
                  value={pricePerLiter}
                  onChangeText={setPricePerLiter}
                  placeholder="Ex: 5,89"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor Total (R$)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#6B7280" />
                <TextInput
                  style={styles.inputWithIcon}
                  value={totalValue}
                  onChangeText={setTotalValue}
                  placeholder="Ex: 280,50"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Litros (Calculado)</Text>
              <TextInput
                style={styles.input}
                value={calculatedLiters > 0 ? calculatedLiters.toFixed(2) : ''}
                placeholder="Será calculado automaticamente"
                editable={false}
              />
              <Text style={styles.hint}>
                Calculado automaticamente: Valor Total ÷ Valor do Litro
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Posto</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#6B7280" />
                <TextInput
                  style={styles.inputWithIcon}
                  value={stationName}
                  onChangeText={setStationName}
                  placeholder="Nome do posto"
                />
              </View>
              
              {stations.length > 0 && (
                <View style={styles.stationSuggestions}>
                  <Text style={styles.suggestionsTitle}>Postos usados:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {stations.map((station) => (
                      <TouchableOpacity
                        key={station.id}
                        style={styles.suggestionChip}
                        onPress={() => setStationName(station.name)}
                      >
                        <Text style={styles.suggestionText}>{station.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {sortedRefuels.length === 0 && !showForm ? (
          <View style={styles.emptyRefuels}>
            <Plus size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum abastecimento registrado</Text>
            <Text style={styles.emptySubtitle}>
              Registre seus abastecimentos para acompanhar o consumo.
            </Text>
          </View>
        ) : (
          <View style={styles.refuelsList}>
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
                        <Text style={styles.metricValue}>{refuel.liters.toFixed(1)}L</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  inputWithIcon: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  stationSuggestions: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#1F2937',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyRefuels: {
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
  refuelsList: {
    gap: 12,
  },
  totalRefuels: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  refuelCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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