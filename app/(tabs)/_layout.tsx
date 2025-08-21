import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Car, Chrome as Home, Plus } from 'lucide-react-native';

// Componente customizado para o botão de abastecimento destacado
function CustomAddButton({ children, onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.customAddButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.addButtonContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="refuels"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Plus size={28} color="#FFFFFF" />
          ),
          tabBarButton: (props) => <CustomAddButton {...props} />,
        }}
      />
      
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Veículos',
          tabBarIcon: ({ size, color }) => (
            <Car size={size} color={color} />
          ),
        }}
      />
      
      {/* Telas ocultas - acessíveis apenas pelo menu hambúrguer */}
      <Tabs.Screen
        name="stations"
        options={{
          href: null, // Remove da barra de navegação
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customAddButton: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContent: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});