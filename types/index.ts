export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  initialKm: number;
  createdAt: Date;
  userId: string;
}

export interface FuelStation {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}

export interface Refuel {
  id: string;
  vehicleId: string;
  date: Date;
  currentKm: number;
  liters: number;
  totalValue?: number;
  stationId: string;
  stationName: string;
  consumption?: number;
  kmTraveled?: number;
  userId: string;
}

export interface VehicleStats {
  totalRefuels: number;
  totalKm: number;
  totalLiters: number;
  generalAverage: number;
  stationAverages: StationAverage[];
  lastRefuel?: Refuel;
}

export interface StationAverage {
  stationId: string;
  stationName: string;
  average: number;
  refuelCount: number;
  totalKm: number;
  totalLiters: number;
}