import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '@/config/firebase';
import { Vehicle, Refuel, FuelStation } from '@/types';

// Auth functions
export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Vehicle functions
export const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'userId'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const docRef = await addDoc(collection(db, 'vehicles'), {
    ...vehicle,
    userId: auth.currentUser.uid,
    createdAt: new Date()
  });
  
  return docRef.id;
};

export const updateVehicle = async (vehicleId: string, updates: Partial<Vehicle>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const vehicleRef = doc(db, 'vehicles', vehicleId);
  await updateDoc(vehicleRef, updates);
};

export const deleteVehicle = async (vehicleId: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const batch = writeBatch(db);
  
  // Delete vehicle
  const vehicleRef = doc(db, 'vehicles', vehicleId);
  batch.delete(vehicleRef);
  
  // Delete all refuels for this vehicle
  const refuelsQuery = query(
    collection(db, 'refuels'),
    where('vehicleId', '==', vehicleId),
    where('userId', '==', auth.currentUser.uid)
  );
  
  const refuelsSnapshot = await getDocs(refuelsQuery);
  refuelsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
};

export const getUserVehicles = (callback: (vehicles: Vehicle[]) => void) => {
  if (!auth.currentUser) return () => {};
  
  const q = query(
    collection(db, 'vehicles'),
    where('userId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Vehicle[];
    
    callback(vehicles);
  });
};

// Refuel functions
export const addRefuel = async (refuel: Omit<Refuel, 'id' | 'userId' | 'consumption' | 'kmTraveled'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const docRef = await addDoc(collection(db, 'refuels'), {
    ...refuel,
    userId: auth.currentUser.uid
  });
  
  return docRef.id;
};

export const deleteRefuel = async (refuelId: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const refuelRef = doc(db, 'refuels', refuelId);
  await deleteDoc(refuelRef);
};

export const getVehicleRefuels = (vehicleId: string, callback: (refuels: Refuel[]) => void) => {
  if (!auth.currentUser) return () => {};
  
  const q = query(
    collection(db, 'refuels'),
    where('vehicleId', '==', vehicleId),
    where('userId', '==', auth.currentUser.uid),
    orderBy('currentKm', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const refuels = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Refuel[];
    
    callback(refuels);
  });
};

// Station functions
export const addOrUpdateStation = async (stationName: string): Promise<string> => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  // Check if station already exists
  const q = query(
    collection(db, 'stations'),
    where('name', '==', stationName.trim()),
    where('userId', '==', auth.currentUser.uid)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  
  // Create new station
  const docRef = await addDoc(collection(db, 'stations'), {
    name: stationName.trim(),
    userId: auth.currentUser.uid,
    createdAt: new Date()
  });
  
  return docRef.id;
};

export const updateStation = async (stationId: string, newName: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const batch = writeBatch(db);
  
  // Update station name
  const stationRef = doc(db, 'stations', stationId);
  batch.update(stationRef, { name: newName.trim() });
  
  // Update all refuels with this station
  const refuelsQuery = query(
    collection(db, 'refuels'),
    where('stationId', '==', stationId),
    where('userId', '==', auth.currentUser.uid)
  );
  
  const refuelsSnapshot = await getDocs(refuelsQuery);
  refuelsSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { stationName: newName.trim() });
  });
  
  await batch.commit();
};

export const getUserStations = (callback: (stations: FuelStation[]) => void) => {
  if (!auth.currentUser) return () => {};
  
  const q = query(
    collection(db, 'stations'),
    where('userId', '==', auth.currentUser.uid),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const stations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as FuelStation[];
    
    callback(stations);
  });
};