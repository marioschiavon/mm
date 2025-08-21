import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Plus, Calendar, MapPin, DollarSign, Gauge } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function AddRefuelScreen() {
  const { vehicle, stations, loading, addRefuel, addStation } = useApp();
  const [currentKm, setCurrentKm] = useState('');
  const [liters, setLiters] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [stationName, setStationName] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [date, setDate] = useState(new Date());

  if (loading) {
    return <LoadingScreen />;
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Plus size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Cadastre um veículo primeiro</Text>
          <Text style={styles.emptySubtitle}>
            Para registrar abastecimentos, você precisa cadastrar um veículo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!currentKm.trim() || !liters.trim() || !totalValue.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const kmValue = parseInt(currentKm, 10);
    const litersValue = parseFloat(liters);
    const valueAmount = parseFloat(totalValue.replace(',', '.'));

    if (isNaN(kmValue) || kmValue <= vehicle.initialKm) {
      Alert.alert('Erro', `A quilometragem deve ser maior que ${vehicle.initialKm} km.`);
      return;
    }

    if (isNaN(litersValue) || litersValue <= 0) {
      Alert.alert('Erro', 'A quantidade de litros deve ser um número válido.');
      return;
    }

    if (isNaN(valueAmount) || valueAmount <= 0) {
      Alert.alert('Erro', 'O valor total deve ser um número válido.');
      return;
    }

    try {
      let stationId = selectedStationId;
      
      if (!stationId && stationName.trim()) {
        const newStation = await addStation(stationName.trim());
        stationId = newStation.id;
      } else if (!stationId) {
        Alert.alert('Erro', 'Selecione um posto ou digite o nome de um novo.');
        return;
      }

      await addRefuel({
        vehicleId: vehicle.id,
        date,
        currentKm: kmValue,
        liters: litersValue,
        totalValue: valueAmount,
        stationId,
      });

      // Reset form
      setCurrentKm('');
      setLiters('');
      setTotalValue('');
      setStationName('');
      setSelectedStationId('');
      setDate(new Date());

      Alert.alert('Sucesso', 'Abastecimento registrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar o abastecimento.');
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Plus size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Novo Abastecimento</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <View style={styles.dateContainer}>
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>
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
                placeholder={`Maior que ${vehicle.initialKm} km`}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Litros</Text>
            <TextInput
              style={styles.input}
              value={liters}
              onChangeText={setLiters}
              placeholder="Ex: 45.5"
              keyboardType="numeric"
            />
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
            <Text style={styles.label}>Posto de Combustível</Text>
            
            {stations.length > 0 && (
              <View style={styles.stationsList}>
                <Text style={styles.stationsListTitle}>Postos salvos:</Text>
                {stations.map((station) => (
                  <TouchableOpacity
                    key={station.id}
                    style={[
                      styles.stationItem,
                      selectedStationId === station.id && styles.selectedStationItem
                    ]}
                    onPress={() => {
                      setSelectedStationId(station.id);
                      setStationName('');
                    }}
                  >
                    <MapPin size={16} color={selectedStationId === station.id ? '#3B82F6' : '#6B7280'} />
                    <Text style={[
                      styles.stationItemText,
                      selectedStationId === station.id && styles.selectedStationItemText
                    ]}>
                      {station.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.orText}>ou digite um novo posto:</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6B7280" />
              <TextInput
                style={styles.inputWithIcon}
                value={stationName}
                onChangeText={(text) => {
                  setStationName(text);
                  if (text.trim()) {
                    setSelectedStationId('');
                  }
                }}
                placeholder="Nome do posto"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Registrar Abastecimento</Text>
          </TouchableOpacity>
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
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
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
  stationsList: {
    marginBottom: 12,
  },
  stationsListTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  selectedStationItem: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  stationItemText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  selectedStationItemText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  orText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});