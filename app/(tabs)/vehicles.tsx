import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Car, Plus, CreditCard as Edit3, Trash2, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthScreen } from '@/components/AuthScreen';

export default function VehiclesScreen() {
  const { 
    user, 
    loading, 
    vehicles, 
    selectedVehicle, 
    selectVehicle, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle 
  } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [initialKm, setInitialKm] = useState('');

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const resetForm = () => {
    setName('');
    setPlate('');
    setInitialKm('');
    setShowForm(false);
    setEditingVehicle(null);
  };

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
      if (editingVehicle) {
        await updateVehicle(editingVehicle, {
          name: name.trim(),
          plate: plate.trim().toUpperCase(),
          initialKm: kmValue,
        });
        Alert.alert('Sucesso', 'Veículo atualizado com sucesso!');
      } else {
        await addVehicle({
          name: name.trim(),
          plate: plate.trim().toUpperCase(),
          initialKm: kmValue,
        });
        Alert.alert('Sucesso', 'Veículo cadastrado com sucesso!');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o veículo.');
    }
  };

  const handleEdit = (vehicle: any) => {
    setName(vehicle.name);
    setPlate(vehicle.plate);
    setInitialKm(vehicle.initialKm.toString());
    setEditingVehicle(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = (vehicleId: string, vehicleName: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o veículo "${vehicleName}"?\n\nTodos os abastecimentos relacionados também serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteVehicle(vehicleId)
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Car size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Meus Veículos</Text>
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
            <Text style={styles.formTitle}>
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Veículo</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Honda Civic"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Placa</Text>
              <TextInput
                style={styles.input}
                value={plate}
                onChangeText={(text) => setPlate(text.toUpperCase())}
                placeholder="Ex: ABC-1234"
                maxLength={8}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quilometragem Inicial</Text>
              <TextInput
                style={styles.input}
                value={initialKm}
                onChangeText={setInitialKm}
                placeholder="Ex: 50000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {vehicles.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Car size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum veículo cadastrado</Text>
            <Text style={styles.emptySubtitle}>
              Cadastre seu primeiro veículo para começar a controlar o consumo.
            </Text>
          </View>
        ) : (
          <View style={styles.vehiclesList}>
            {vehicles.map((vehicle) => (
              <View key={vehicle.id} style={[
                styles.vehicleCard,
                selectedVehicle?.id === vehicle.id && styles.selectedVehicleCard
              ]}>
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                    {selectedVehicle?.id === vehicle.id && (
                      <View style={styles.selectedBadge}>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.selectedText}>Selecionado</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                  <Text style={styles.vehicleKm}>
                    Km inicial: {vehicle.initialKm.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.vehicleActions}>
                  {selectedVehicle?.id !== vehicle.id && (
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => selectVehicle(vehicle)}
                    >
                      <Text style={styles.selectButtonText}>Selecionar</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(vehicle)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(vehicle.id, vehicle.name)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
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
  vehiclesList: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedVehicleCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  vehicleKm: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  vehicleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
});