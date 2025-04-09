import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  groupId?: string;
}

export async function getUserRestaurants(): Promise<Restaurant[]> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));
  } catch (error) {
    console.error('Error fetching user restaurants:', error);
    throw error;
  }
}

export async function getCurrentUserRestaurants(): Promise<Restaurant[]> {
  return getUserRestaurants();
} 