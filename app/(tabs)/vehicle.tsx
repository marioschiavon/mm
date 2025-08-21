import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Car, CreditCard as Edit3, Save } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function VehicleScreen() {
  const { vehicle, loading, saveVehicle, updateVehicle } = useApp();
  const [isEditing, setIsEditing] = useState(!vehicle);
  const [name, setName] = useState(vehicle?.name || '');
  const [plate, setPlate] = useState(vehicle?.plate || '');
  const [initialKm, setInitialKm] = useState(vehicle?.initialKm.toString() || '');

  if (loading) {
    return <LoadingScreen />;
  }

  const handleSave = async () => {
    if (!name.trim() || !plate.trim() || !initialKm.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const kmValue = parseInt(initialKm, 10);
    if (isNaN(kmValue) || kmValue < 0) {
      Alert.alert('Erro', 'A quilometragem deve ser um número válido.');
      return;
    }

    try {
      if (vehicle) {
        await updateVehicle({
          name: name.trim(),
          plate: plate.trim().toUpperCase(),
          initialKm: kmValue,
        });
      } else {
        await saveVehicle({
          name: name.trim(),
          plate: plate.trim().toUpperCase(),
          initialKm: kmValue,
        });
      }
      setIsEditing(false);
      Alert.alert('Sucesso', 'Veículo salvo com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o veículo.');
    }
  };

  const handleEdit = () => {
    if (vehicle) {
      setName(vehicle.name);
      setPlate(vehicle.plate);
      setInitialKm(vehicle.initialKm.toString());
    }
    setIsEditing(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Car size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>
            {vehicle ? 'Meu Veículo' : 'Cadastrar Veículo'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {!vehicle && (
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Cadastre seu veículo</Text>
            <Text style={styles.introText}>
              Para começar a controlar o consumo de combustível, primeiro precisamos das informações do seu veículo.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Veículo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Honda Civic"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Placa</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={plate}
              onChangeText={(text) => setPlate(text.toUpperCase())}
              placeholder="Ex: ABC-1234"
              maxLength={8}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quilometragem Inicial</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={initialKm}
              onChangeText={setInitialKm}
              placeholder="Ex: 50000"
              keyboardType="numeric"
              editable={isEditing}
            />
            <Text style={styles.hint}>
              Informe a quilometragem atual do veículo
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            ) : vehicle ? (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit3 size={20} color="#3B82F6" />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {vehicle && !isEditing && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cadastrado em:</Text>
              <Text style={styles.infoValue}>
                {vehicle.createdAt.toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        )}
      </View>
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
  introSection: {
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
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
});