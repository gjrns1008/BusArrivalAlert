import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AdBanner from '../components/AdBanner';
import StatusPill from '../components/StatusPill';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { getArrivalsByStation, type BusArrival } from '../services/busApi';

type RouteParams = { stationId: string; stationName: string };
type FilterKey = 'all' | 'soon' | 'lowFloor' | 'lastBus';

const ALERT_MINUTES = [3, 5, 10];

export default function ArrivalScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { stationId, stationName } = route.params as RouteParams;
  const { getAlertMinutes, settings, toggleAlertMinute } = useAppPreferences();

  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const loadArrivals = useCallback(async () => {
    const data = await getArrivalsByStation(stationId);
    setArrivals(data);
    setLastUpdate(new Date());
    setLoading(false);
  }, [stationId]);

  useEffect(() => {
    navigation.setOptions({ title: stationName });
    loadArrivals();
  }, [loadArrivals, navigation, stationName]);

  useEffect(() => {
    if (!settings.autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      loadArrivals();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadArrivals, settings.autoRefresh]);

  async function onRefresh() {
    setRefreshing(true);
    await loadArrivals();
    setRefreshing(false);
  }

  const filteredArrivals = useMemo(() => {
    switch (activeFilter) {
      case 'soon':
        return arrivals.filter(item => item.arrTime <= 5);
      case 'lowFloor':
        return arrivals.filter(item => item.isLowFloor);
      case 'lastBus':
        return arrivals.filter(item => item.isLast);
      default:
        return arrivals;
    }
  }, [activeFilter, arrivals]);

  function formatTime(minutes: number): string {
    if (minutes <= 0) return '곧 도착';
    if (minutes === 1) return '1분 이내';
    return `${minutes}분`;
  }

  function getTimeColor(minutes: number): string {
    if (minutes <= 1) return '#D32F2F';
    if (minutes <= 3) return '#F57C00';
    if (minutes <= 5) return '#1976D2';
    return '#2E7D32';
  }

  function getCrowdInfo(seats: number) {
    if (seats <= 0) {
      return { label: '혼잡', tone: 'red' as const };
    }
    if (seats < 8) {
      return { label: `보통 ${seats}석`, tone: 'orange' as const };
    }
    return { label: `여유 ${seats}석`, tone: 'green' as const };
  }

  function formatLastUpdate(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  }

  function renderFilterChip(filter: FilterKey, label: string) {
    const active = activeFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterChip, active && styles.filterChipActive]}
        onPress={() => setActiveFilter(filter)}
      >
        <Text
          style={[styles.filterChipText, active && styles.filterChipTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>버스 정보를 가져오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.updateBar}>
        <Text style={styles.updateBarText}>
          마지막 업데이트 {formatLastUpdate(lastUpdate)}
        </Text>
        <StatusPill
          label={settings.autoRefresh ? '30초 자동 갱신' : '수동 새로고침'}
          tone="gray"
        />
      </View>

      <View style={styles.filterRow}>
        {renderFilterChip('all', '전체')}
        {renderFilterChip('soon', '5분 이내')}
        {renderFilterChip('lowFloor', '저상버스')}
        {renderFilterChip('lastBus', '막차')}
      </View>

      <FlatList
        data={filteredArrivals}
        keyExtractor={item => `${item.routeNo}-${item.arrTime}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Icon name="directions-bus" size={64} color="#DDD" />
            <Text style={styles.emptyText}>
              선택한 필터에 맞는 버스가 없습니다
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const crowd = getCrowdInfo(item.seatAvailable);
          const alertMinutes = getAlertMinutes(stationId, item.routeNo);

          return (
            <View style={styles.arrivalCard}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.busNumberBadge,
                      { backgroundColor: `${item.routeType}20` },
                    ]}
                  >
                    <Text style={[styles.busNumber, { color: item.routeType }]}>
                      {item.busNumber}
                    </Text>
                  </View>
                  <View style={styles.busInfo}>
                    <Text style={styles.destination}>{item.destination}</Text>
                    <View style={styles.tagRow}>
                      {item.isLowFloor && (
                        <StatusPill label="저상" tone="blue" />
                      )}
                      {item.isLast && <StatusPill label="막차" tone="orange" />}
                      <StatusPill label={crowd.label} tone={crowd.tone} />
                    </View>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text
                    style={[
                      styles.arrivalTime,
                      { color: getTimeColor(item.arrTime) },
                    ]}
                  >
                    {formatTime(item.arrTime)}
                  </Text>
                  <Text style={styles.prevStation}>
                    전 정류장 {item.arrPrevStation}개
                  </Text>
                </View>
              </View>

              <View style={styles.alertSection}>
                <Text style={styles.alertTitle}>도착 알림</Text>
                <View style={styles.alertRow}>
                  {ALERT_MINUTES.map(minute => {
                    const active = alertMinutes.includes(minute);
                    return (
                      <TouchableOpacity
                        key={`${item.routeNo}-${minute}`}
                        style={[
                          styles.alertChip,
                          active && styles.alertChipActive,
                        ]}
                        onPress={() =>
                          toggleAlertMinute(stationId, item.routeNo, minute)
                        }
                      >
                        <Text
                          style={[
                            styles.alertChipText,
                            active && styles.alertChipTextActive,
                          ]}
                        >
                          {minute}분 전
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={<AdBanner />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#999' },
  emptyText: {
    fontSize: 15,
    color: '#90A4AE',
    marginTop: 12,
    textAlign: 'center',
  },
  updateBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  updateBarText: { fontSize: 12, color: '#78909C' },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    backgroundColor: '#ECEFF1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: '#2196F3' },
  filterChipText: { color: '#607D8B', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#FFF' },
  listContent: { padding: 16, paddingBottom: 24 },
  arrivalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: { flexDirection: 'row', flex: 1, marginRight: 12 },
  busNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  busNumber: { fontSize: 18, fontWeight: '700' },
  busInfo: { marginLeft: 12, flex: 1 },
  destination: { fontSize: 15, color: '#263238', fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  cardRight: { alignItems: 'flex-end' },
  arrivalTime: { fontSize: 24, fontWeight: '800' },
  prevStation: { fontSize: 12, color: '#78909C', marginTop: 4 },
  alertSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  alertRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  alertChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  alertChipActive: { backgroundColor: '#1565C0' },
  alertChipText: { color: '#1565C0', fontSize: 12, fontWeight: '700' },
  alertChipTextActive: { color: '#FFF' },
});
