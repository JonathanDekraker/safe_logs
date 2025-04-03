import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, statusColors } from '@/constants/colors';

type StatusType = 'completed' | 'pending' | 'inProgress';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'inProgress':
        return 'In Progress';
      default:
        return '';
    }
  };

  const getStyles = () => {
    const baseStyles = {
      backgroundColor: statusColors[status] + '20', // 20% opacity
      borderColor: statusColors[status],
    };

    const sizeStyles = {
      small: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
      },
      medium: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
      },
      large: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
      },
    };

    const textSizeStyles = {
      small: {
        fontSize: 10,
      },
      medium: {
        fontSize: 12,
      },
      large: {
        fontSize: 14,
      },
    };

    return {
      container: {
        ...baseStyles,
        ...sizeStyles[size],
      },
      text: {
        ...textSizeStyles[size],
      },
    };
  };

  const dynamicStyles = getStyles();

  return (
    <View style={[styles.badge, dynamicStyles.container]}>
      <Text style={[styles.text, { color: statusColors[status] }, dynamicStyles.text]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});