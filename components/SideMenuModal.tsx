import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  X, 
  Chrome as Home, 
  Car, 
  Plus, 
  MapPin, 
  History, 
  Settings, 
  Fuel,
  LogOut
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SideMenuModal({ visible, onClose }: SideMenuModalProps) {
  const router = useRouter();
  const { user, selectedVehicle, signOut } = useApp();

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', route: '/' },
    { icon: Car, label: 'Veículos', route: '/vehicles' },
    { icon: Plus, label: 'Abastecimentos', route: '/refuels' },
    { icon: MapPin, label: 'Postos', route: '/stations' },
    { icon: History, label: 'Histórico', route: '/history' },
    { icon: Settings, label: 'Configurações', route: '/settings' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Fuel size={24} color="#3B82F6" />
              <Text style={styles.appTitle}>MM minha média</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              {selectedVehicle && (
                <Text style={styles.selectedVehicle}>
                  {selectedVehicle.name} • {selectedVehicle.plate}
                </Text>
              )}
            </View>
          )}

          <ScrollView style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.route)}
              >
                <item.icon size={20} color="#6B7280" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.signOutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    height: '100%',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userEmail: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedVehicle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '500',
  },
});