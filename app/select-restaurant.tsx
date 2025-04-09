import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { getUserRestaurants, Restaurant } from '../utils/userRestaurants';
import { setSelectedRestaurant } from '../utils/selectedRestaurant';

export default function SelectRestaurantScreen() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurantState] = useState<Restaurant | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const userRestaurants = await getUserRestaurants();
      console.log("Loaded restaurants:", userRestaurants);
      setRestaurants(userRestaurants);

      // Auto-select if user only has one restaurant
      if (userRestaurants.length === 1) {
        handleSelectRestaurant(userRestaurants[0]);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      Alert.alert('Error', 'Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    try {
      setLoading(true);
      await setSelectedRestaurant(restaurant);
      setSelectedRestaurantState(restaurant);
      router.replace('/(tabs)');
    } catch (error) {
      console.error("Error selecting restaurant:", error);
      Alert.alert('Error', 'Failed to select restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b5998" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Restaurant</Text>
      
      {restaurants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No restaurants available</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.restaurantList}>
          {restaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={[
                styles.restaurantItem,
                selectedRestaurant?.id === restaurant.id && styles.selectedRestaurant
              ]}
              onPress={() => handleSelectRestaurant(restaurant)}
            >
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  restaurantList: {
    flex: 1,
  },
  restaurantItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedRestaurant: {
    borderColor: '#3b5998',
    borderWidth: 2,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 