import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Restaurant } from './userRestaurants';

export interface SelectedRestaurant extends Restaurant {
  updatedAt: string;
}

/**
 * Gets the currently selected restaurant for the logged-in user
 * @returns Promise that resolves to the selected restaurant or null if none is selected
 */
export async function getSelectedRestaurant(): Promise<SelectedRestaurant | null> {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user logged in, cannot get selected restaurant");
    return null;
  }

  try {
    const docRef = doc(db, 'userSelections', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Retrieved selected restaurant:", data);
      return data as SelectedRestaurant;
    } else {
      console.log("No restaurant selected for user");
      return null;
    }
  } catch (error) {
    console.error("Error getting selected restaurant:", error);
    throw error;
  }
}

/**
 * Sets the selected restaurant for the logged-in user
 * @param restaurant The restaurant to select
 * @returns Promise that resolves when the selection is saved
 */
export async function setSelectedRestaurant(restaurant: Restaurant): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    const selectedRestaurant: SelectedRestaurant = {
      ...restaurant,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'userSelections', user.uid), selectedRestaurant);
    console.log("Saved selected restaurant:", selectedRestaurant);
  } catch (error) {
    console.error("Error setting selected restaurant:", error);
    throw error;
  }
} 