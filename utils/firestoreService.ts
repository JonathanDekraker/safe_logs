// utils/firestoreService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const COLLECTION_NAME = 'test_data';

export const saveData = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const fetchData = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return data;
};
