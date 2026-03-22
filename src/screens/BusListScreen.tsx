import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { MOCK_ROUTES } from '../services/busApi';

const ALL_ROUTES = Object.values(MOCK_ROUTES);

export default function BusListScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = searchQuery.length < 2
    ? ALL_ROUTES
    : ALL_ROUTES.filter(
        r =>
          r.busNumber.includes(searchQuery) ||
          r.destination.includes(searchQuery)
      );

  function getRouteColor(route: string): string {
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#009688', '#795548'];
    let hash = 0;
    for (let i = 0; i < route.length; i++) {
      hash = route.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>버스 검색</Text>
        <Text style={styles.subtitle}>버스 번호 또는 경로를 검색하세요</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="버스 번호 검색"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRoutes}
        keyExtractor={item => item.busNumber}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.routeCard}>
            <View style={[styles.routeBadge, { backgroundColor: item.color }]}>
              <Text style={styles.routeNumber}>{item.busNumber}</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.destination}>→ {item.destination}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color="#DDD" />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  routeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  routeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  routeNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
  },
  routeInfo: {
    marginLeft: 14,
    flex: 1,
  },
  destination: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
