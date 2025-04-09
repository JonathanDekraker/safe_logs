import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { 
  getUserRestaurantGroups, 
  addUserToRestaurantGroup, 
  removeUserFromRestaurantGroup,
  RestaurantGroup
} from '../utils/userRestaurants';
import { auth } from '../utils/firebase';

export default function RestaurantGroupManager() {
  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupId, setNewGroupId] = useState('');
  const [newUserId, setNewUserId] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to manage restaurant groups');
        return;
      }
      
      const userGroups = await getUserRestaurantGroups(currentUser.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load restaurant groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserToGroup = async () => {
    if (!newUserId || !newGroupId) {
      Alert.alert('Error', 'Please enter both user ID and group ID');
      return;
    }

    try {
      await addUserToRestaurantGroup(newUserId, newGroupId);
      Alert.alert('Success', 'User added to restaurant group');
      setNewUserId('');
      setNewGroupId('');
      loadGroups(); // Refresh the list
    } catch (error) {
      console.error('Error adding user to group:', error);
      Alert.alert('Error', 'Failed to add user to restaurant group');
    }
  };

  const handleRemoveUserFromGroup = async (mappingId: string) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this user from the restaurant group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeUserFromRestaurantGroup(mappingId);
              Alert.alert('Success', 'User removed from restaurant group');
              loadGroups(); // Refresh the list
            } catch (error) {
              console.error('Error removing user from group:', error);
              Alert.alert('Error', 'Failed to remove user from restaurant group');
            }
          }
        }
      ]
    );
  };

  const renderGroupItem = ({ item }: { item: RestaurantGroup }) => (
    <View style={styles.groupItem}>
      <View style={styles.groupInfo}>
        <Text style={styles.groupId}>Group ID: {item.groupId}</Text>
        <Text style={styles.userId}>User ID: {item.userId}</Text>
        <Text style={styles.role}>Role: {item.role}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveUserFromGroup(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b5998" />
        <Text style={styles.loadingText}>Loading restaurant groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Restaurant Groups</Text>
      
      <View style={styles.addForm}>
        <Text style={styles.formTitle}>Add User to Group</Text>
        <TextInput
          style={styles.input}
          placeholder="User ID"
          value={newUserId}
          onChangeText={setNewUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="Group ID"
          value={newGroupId}
          onChangeText={setNewGroupId}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddUserToGroup}
        >
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.listTitle}>Current Group Memberships</Text>
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No restaurant group memberships found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  addForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3b5998',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  groupItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupInfo: {
    flex: 1,
  },
  groupId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
}); 