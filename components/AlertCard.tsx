import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alert } from '@/types';
import { colors } from '@/constants/colors';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react-native';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface AlertCardProps {
  alert: Alert;
  onPress: () => void;
  onDismiss: () => void;
}

export default function AlertCard({ alert, onPress, onDismiss }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'danger':
        return <AlertTriangle size={24} color={colors.danger} />;
      case 'warning':
        return <AlertTriangle size={24} color={colors.warning} />;
      case 'info':
        return <Info size={24} color={colors.primary} />;
      default:
        return <Info size={24} color={colors.primary} />;
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: getAlertColor() },
        alert.isRead && styles.readContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getAlertIcon()}</View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.timestamp}>{formatDistanceToNow(alert.timestamp)} ago</Text>
      </View>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <X size={16} color={colors.gray} />
      </TouchableOpacity>
      {!alert.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  readContainer: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray,
  },
  dismissButton: {
    padding: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});