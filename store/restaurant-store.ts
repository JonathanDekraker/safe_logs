import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  groupId: string;
}

interface RestaurantStore {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  loadSelectedRestaurant: () => Promise<void>;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  selectedRestaurant: null,
  setSelectedRestaurant: async (restaurant) => {
    if (restaurant) {
      await AsyncStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    } else {
      await AsyncStorage.removeItem('selectedRestaurant');
    }
    set({ selectedRestaurant: restaurant });
  },
  loadSelectedRestaurant: async () => {
    try {
      const storedRestaurant = await AsyncStorage.getItem('selectedRestaurant');
      if (storedRestaurant) {
        set({ selectedRestaurant: JSON.parse(storedRestaurant) });
      }
    } catch (error) {
      console.error('Error loading selected restaurant:', error);
    }
  },
})); 