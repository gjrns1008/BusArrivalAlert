import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getArrivalsByStation, searchStations, Station, BusArrival } from '../services/busApi';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AdBanner from '../components/AdBanner';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // 초기 정류소 목록 (목업 또는 API)
    loadStations();
  }, []);

  async function loadStations() {
    setLoading(true);
    const results = await searchStations('역삼');
    setStations(results.length > 0 ? results : []);
    setLoading(false);
  }

  async function handleSearch(text: string) {
    setSearchQuery(text);
    if (text.length < 2) {
      setStations([]);
      return;
    }
    setLoading(true);
    const results = await searchStations(text);
    setStations(results);
    setLoading(false);
  }

  function handleStationPress(station: Station) {
    navigation.navigate('Arrival', {
      stationId: station.stationId,
      stationName: station.stationName,
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  }

  function formatTime(minutes: number): string {
    if (minutes <= 0) return '도착';
    if (minutes === 1) return '1분 이내';
    return `${minutes}분`;
  }

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
        <Text style={styles.title}>버스 도착 정보</Text>
        <Text style={styles.subtitle}>실시간 버스 도착 시간을 확인하세요</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="정류소 이름 또는 버스 번호 검색"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {loading && stations.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : stations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="directions-bus" size={64} color="#DDD" />
          <Text style={styles.emptyText}>
            {searchQuery.length > 0
              ? '검색 결과가 없습니다'
              : '정류소를 검색하거나刷新하여 주세요'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={stations}
          keyExtractor={item => item.stationId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.stationCard} onPress={() => handleStationPress(item)}>
              <View style={styles.stationHeader}>
                <Icon name="directions-bus" size={24} color="#2196F3" />
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{item.stationName}</Text>
                  <Text style={styles.stationId}>정류소 ID: {item.stationId}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#CCC" />
              </View>
              <View style={styles.routeContainer}>
                {item.routes.slice(0, 5).map(route => (
                  <View key={route} style={[styles.routeChip, { backgroundColor: getRouteColor(route) + '20' }]}>
                    <Text style={[styles.routeChipText, { color: getRouteColor(route) }]}>{route}</Text>
                  </View>
                ))}
                {item.routes.length > 5 && (
                  <Text style={styles.moreRoutes}>+{item.routes.length - 5}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <AdBanner />
    </SafeAreaView>
  );
}

function isApiConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_SEOUL_BUS_API_KEY?.length ?? 0) > 0;
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
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  stationId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  routeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  moreRoutes: {
    fontSize: 13,
    color: '#999',
    alignSelf: 'center',
    marginLeft: 4,
  },
  mockBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
  },
  mockBadgeText: {
    fontSize: 12,
    color: '#FF9800',
  },
});
