import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { useRestaurantStore } from '@/store/restaurant-store';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  groupId: string;
  status: string;
}

export default function RestaurantSelectScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setSelectedRestaurant = useRestaurantStore(state => state.setSelectedRestaurant);

  const fetchUserRestaurants = async () => {
    try {
      setError(null);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        router.replace('/login');
        return;
      }

      // Get all groupMembers entries for this user
      const groupMembersRef = collection(db, 'groupMembers');
      const groupMembersQuery = query(groupMembersRef, where('userId', '==', userId));
      const groupMembersSnapshot = await getDocs(groupMembersQuery);
      
      // Get all the groupIds the user has access to
      const groupIds = groupMembersSnapshot.docs.map(doc => doc.data().groupId);
      
      if (groupIds.length === 0) {
        setError('You do not have access to any restaurants. Please contact your administrator.');
        return;
      }
      
      // Get all restaurants that belong to these groups
      const restaurantsRef = collection(db, 'restaurants');
      const restaurantsQuery = query(restaurantsRef, where('groupId', 'in', groupIds));
      const restaurantsSnapshot = await getDocs(restaurantsQuery);
      
      const restaurantsData = restaurantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[];
      
      // Filter out inactive restaurants
      const activeRestaurants = restaurantsData.filter(restaurant => 
        restaurant.status === 'active'
      );
      
      if (activeRestaurants.length === 0) {
        setError('No active restaurants found.');
        return;
      }

      setRestaurants(activeRestaurants);
    } catch (error: any) {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRestaurants();
  }, []);

  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    try {
      await setSelectedRestaurant(restaurant);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to select restaurant. Please try again.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              fetchUserRestaurants();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => handleRestaurantSelect(item)}
          >
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.restaurantAddress}>{item.address}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Restaurant</Text>
              <Text style={styles.subtitle}>Choose a restaurant to continue</Text>
            </View>
            {renderContent()}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
  },
  listContainer: {
    flexGrow: 1,
  },
  restaurantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 