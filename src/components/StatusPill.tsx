import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StatusPill({
  label,
  tone = 'blue',
}: {
  label: string;
  tone?: 'blue' | 'green' | 'orange' | 'gray' | 'red';
}) {
  const palette = tones[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const tones = {
  blue: { backgroundColor: '#E3F2FD', color: '#1565C0' },
  green: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  orange: { backgroundColor: '#FFF3E0', color: '#EF6C00' },
  gray: { backgroundColor: '#ECEFF1', color: '#546E7A' },
  red: { backgroundColor: '#FFEBEE', color: '#C62828' },
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
