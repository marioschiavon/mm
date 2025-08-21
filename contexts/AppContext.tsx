import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Vehicle, FuelStation, Refuel, VehicleStats, StationAverage } from '@/types';
import * as FirebaseService from '@/services/firebase';

interface AppContextType {
  // Auth
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Vehicles
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  selectVehicle: (vehicle: Vehicle) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  
  // Stations
  stations: FuelStation[];
  updateStationName: (stationId: string, newName: string) => Promise<void>;
  
  // Refuels
  refuels: Refuel[];
  addRefuel: (refuel: Omit<Refuel, 'id' | 'userId' | 'consumption' | 'kmTraveled'>) => Promise<void>;
  deleteRefuel: (refuelId: string) => Promise<void>;
  
  // Statistics
  getVehicleStats: () => VehicleStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [refuels, setRefuels] = useState<Refuel[]>([]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = FirebaseService.onAuthChange((user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        setVehicles([]);
        setSelectedVehicle(null);
        setStations([]);
        setRefuels([]);
      }
    });

    return unsubscribe;
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (!user) return;

    const unsubscribeVehicles = FirebaseService.getUserVehicles(setVehicles);
    const unsubscribeStations = FirebaseService.getUserStations(setStations);

    return () => {
      unsubscribeVehicles();
      unsubscribeStations();
    };
  }, [user]);

  // Load refuels when vehicle is selected
  useEffect(() => {
    if (!selectedVehicle) {
      setRefuels([]);
      return;
    }

    const unsubscribe = FirebaseService.getVehicleRefuels(selectedVehicle.id, (refuels) => {
      // Calculate consumption for each refuel
      const sortedRefuels = refuels.sort((a, b) => a.currentKm - b.currentKm);
      const refuelsWithConsumption = sortedRefuels.map((refuel, index) => {
        if (index === 0) {
          return {
            ...refuel,
            consumption: 0,
            kmTraveled: refuel.currentKm - selectedVehicle.initialKm
          };
        }

        const previousRefuel = sortedRefuels[index - 1];
        const kmTraveled = refuel.currentKm - previousRefuel.currentKm;
        const consumption = kmTraveled > 0 && refuel.liters > 0 
          ? Number((kmTraveled / refuel.liters).toFixed(2))
          : 0;

        return {
          ...refuel,
          consumption,
          kmTraveled
        };
      });

      setRefuels(refuelsWithConsumption);
    });

    return unsubscribe;
  }, [selectedVehicle]);

  const signIn = async (email: string, password: string) => {
    await FirebaseService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await FirebaseService.signUp(email, password);
  };

  const signOut = async () => {
    await FirebaseService.signOut();
    setSelectedVehicle(null);
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'userId'>) => {
    await FirebaseService.addVehicle(vehicleData);
  };

  const updateVehicle = async (vehicleId: string, updates: Partial<Vehicle>) => {
    await FirebaseService.updateVehicle(vehicleId, updates);
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle(null);
    }
    await FirebaseService.deleteVehicle(vehicleId);
  };

  const updateStationName = async (stationId: string, newName: string) => {
    await FirebaseService.updateStation(stationId, newName);
  };

  const addRefuel = async (refuelData: Omit<Refuel, 'id' | 'userId' | 'consumption' | 'kmTraveled'>) => {
    if (!selectedVehicle) throw new Error('No vehicle selected');

    // Ensure station exists
    const stationId = await FirebaseService.addOrUpdateStation(refuelData.stationName);
    
    await FirebaseService.addRefuel({
      ...refuelData,
      stationId
    });
  };

  const deleteRefuel = async (refuelId: string) => {
    await FirebaseService.deleteRefuel(refuelId);
  };

  const getVehicleStats = (): VehicleStats => {
    if (!selectedVehicle || refuels.length === 0) {
      return {
        totalRefuels: 0,
        totalKm: 0,
        totalLiters: 0,
        generalAverage: 0,
        stationAverages: []
      };
    }

    const refuelsWithConsumption = refuels.filter(r => r.consumption && r.consumption > 0);
    const lastRefuel = refuels.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const totalKm = lastRefuel ? lastRefuel.currentKm - selectedVehicle.initialKm : 0;
    const totalLiters = refuels.reduce((sum, r) => sum + r.liters, 0);
    const generalAverage = totalLiters > 0 ? Number((totalKm / totalLiters).toFixed(2)) : 0;

    // Calculate station averages
    const stationData: { [key: string]: { 
      totalKm: number; 
      totalLiters: number; 
      name: string; 
      count: number;
    } } = {};

    refuelsWithConsumption.forEach(refuel => {
      if (!stationData[refuel.stationId]) {
        stationData[refuel.stationId] = {
          totalKm: 0,
          totalLiters: 0,
          name: refuel.stationName,
          count: 0
        };
      }
      
      stationData[refuel.stationId].totalKm += refuel.kmTraveled || 0;
      stationData[refuel.stationId].totalLiters += refuel.liters;
      stationData[refuel.stationId].count += 1;
    });

    const stationAverages: StationAverage[] = Object.entries(stationData)
      .map(([stationId, data]) => ({
        stationId,
        stationName: data.name,
        average: data.totalLiters > 0 ? Number((data.totalKm / data.totalLiters).toFixed(2)) : 0,
        refuelCount: data.count,
        totalKm: data.totalKm,
        totalLiters: data.totalLiters
      }))
      .sort((a, b) => b.average - a.average);

    return {
      totalRefuels: refuels.length,
      totalKm,
      totalLiters,
      generalAverage,
      stationAverages,
      lastRefuel
    };
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      vehicles,
      selectedVehicle,
      selectVehicle,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      stations,
      updateStationName,
      refuels,
      addRefuel,
      deleteRefuel,
      getVehicleStats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}