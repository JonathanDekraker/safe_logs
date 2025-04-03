import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import { saveData, fetchData } from '../utils/firestoreService';

export default function HomeScreen() {
  const [items, setItems] = useState<any[]>([]);

  const handleSave = async () => {
    await saveData({ message: 'Hello Firebase!', createdAt: new Date() });
  };

  const handleFetch = async () => {
    const data = await fetchData();
    setItems(data);
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="Save Data" onPress={handleSave} />
      <Button title="Fetch Data" onPress={handleFetch} />
      {items.map((item, index) => (
        <Text key={item.id || index}>{item.message}</Text>
      ))}
    </View>
  );
}
