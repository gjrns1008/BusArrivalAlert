import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getArrivalsByStation, BusArrival } from '../services/busApi';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AdBanner from '../components/AdBanner';

export default function ArrivalScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { stationId, stationName } = route.params as { stationId: string; stationName: string };

  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    navigation.setOptions({ title: stationName });
    loadArrivals();
  }, [stationId]);

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      loadArrivals();
    }, 30000);
    return () => clearInterval(interval);
  }, [stationId]);

  async function loadArrivals() {
    const data = await getArrivalsByStation(stationId);
    setArrivals(data);
    setLastUpdate(new Date());
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadArrivals();
    setRefreshing(false);
  }

  function formatTime(minutes: number): string {
    if (minutes <= 0) return '도착';
    if (minutes === 1) return '1분 이내';
    return `${minutes}분`;
  }

  function getTimeColor(minutes: number): string {
    if (minutes <= 1) return '#F44336';
    if (minutes <= 3) return '#FF9800';
    if (minutes <= 5) return '#2196F3';
    return '#4CAF50';
  }

  function getSeatText(seats: number): string {
    if (seats === 0) return '人为本';
    if (seats < 10) return `空席${seats}`;
    return '空席多';
  }

  function formatLastUpdate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>버스 정보를 가져오는 중...</Text>
      </View>
    );
  }

  if (arrivals.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="directions-bus" size={64} color="#DDD" />
        <Text style={styles.emptyText}>해당 정류소에 도착 예정인 버스가 없습니다</Text>
        <Text style={styles.updateText}>마지막 확인: {formatLastUpdate(lastUpdate)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.updateBar}>
        <Icon name="refresh" size={14} color="#999" />
        <Text style={styles.updateBarText}>
          마지막 업데이트: {formatLastUpdate(lastUpdate)} • 30초마다 자동 갱신
        </Text>
      </View>

      <FlatList
        data={arrivals}
        keyExtractor={item => item.routeNo}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
        }
        renderItem={({ item }) => (
          <View style={styles.arrivalCard}>
            <View style={styles.cardLeft}>
              <View style={[styles.busNumberBadge, { backgroundColor: item.routeType + '20' }]}>
                <Text style={[styles.busNumber, { color: item.routeType }]}>{item.busNumber}</Text>
              </View>
              <View style={styles.busInfo}>
                <Text style={styles.destination}>{item.destination}</Text>
                <View style={styles.busDetails}>
                  {item.isLowFloor && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>저상</Text>
                    </View>
                  )}
                  {item.isLast && (
                    <View style={[styles.tag, styles.lastTag]}>
                      <Text style={styles.tagText}>막차</Text>
                    </View>
                  )}
                  <Text style={styles.seatText}>{getSeatText(item.seatAvailable)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardRight}>
              <Text style={[styles.arrivalTime, { color: getTimeColor(item.arrTime) }]}>
                {formatTime(item.arrTime)}
              </Text>
              <Text style={styles.prevStation}>
                전역 {item.arrPrevStation}번째
              </Text>
            </View>
          </View>
        )}
      />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  updateText: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 8,
  },
  updateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    gap: 4,
  },
  updateBarText: {
    fontSize: 12,
    color: '#999',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  arrivalCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  busNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  busInfo: {
    marginLeft: 12,
    flex: 1,
  },
  destination: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  busDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lastTag: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
  },
  seatText: {
    fontSize: 11,
    color: '#999',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  arrivalTime: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  prevStation: {
    fontSize: 11,
    color: '#BBB',
    marginTop: 2,
  },
});
