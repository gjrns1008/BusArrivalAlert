import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AdBanner from '../components/AdBanner';
import StatusPill from '../components/StatusPill';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { getAllRoutes, getRouteDetail } from '../services/busApi';

const ALL_ROUTES = getAllRoutes();

export default function BusListScreen() {
  const { addRecentRoute, recentRoutes } = useAppPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteNo, setSelectedRouteNo] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    if (searchQuery.length < 2) {
      return ALL_ROUTES;
    }

    return ALL_ROUTES.filter(
      route =>
        route.busNumber.includes(searchQuery) ||
        route.destination.includes(searchQuery),
    );
  }, [searchQuery]);

  const selectedRoute = selectedRouteNo
    ? getRouteDetail(selectedRouteNo)
    : null;

  function openRouteDetail(routeNo: string) {
    const route = ALL_ROUTES.find(item => item.routeNo === routeNo);
    if (route) {
      addRecentRoute(route);
    }
    setSelectedRouteNo(routeNo);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>버스 검색</Text>
        <Text style={styles.subtitle}>
          최근 본 노선과 주요 정류장을 빠르게 확인하세요
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="버스 번호 또는 종점 검색"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>최근 본 노선</Text>
        <View style={styles.recentWrap}>
          {recentRoutes.length === 0 ? (
            <Text style={styles.recentEmpty}>
              아직 최근 본 노선이 없습니다.
            </Text>
          ) : (
            recentRoutes.slice(0, 5).map(route => (
              <TouchableOpacity
                key={`recent-${route.routeNo}`}
                style={styles.recentChip}
                onPress={() => openRouteDetail(route.routeNo)}
              >
                <Text style={styles.recentChipText}>{route.busNumber}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      <FlatList
        data={filteredRoutes}
        keyExtractor={item => item.routeNo}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routeCard}
            onPress={() => openRouteDetail(item.routeNo)}
          >
            <View style={[styles.routeBadge, { backgroundColor: item.color }]}>
              <Text style={styles.routeNumber}>{item.busNumber}</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.destination}>→ {item.destination}</Text>
              <Text style={styles.routeMeta}>
                노선 상세, 주요 정류장, 첫차/막차 확인
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color="#B0BEC5" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color="#DDD" />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        }
        ListFooterComponent={<AdBanner />}
      />

      <Modal
        visible={Boolean(selectedRoute)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedRouteNo(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedRoute && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {selectedRoute.busNumber}번
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedRoute.destination}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedRouteNo(null)}>
                    <Icon name="close" size={22} color="#607D8B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.pillRow}>
                  <StatusPill
                    label={`배차 ${selectedRoute.interval}`}
                    tone="blue"
                  />
                  <StatusPill
                    label={`첫차 ${selectedRoute.firstBus}`}
                    tone="green"
                  />
                  <StatusPill
                    label={`막차 ${selectedRoute.lastBus}`}
                    tone="orange"
                  />
                </View>

                <Text style={styles.modalSectionTitle}>주요 정류장</Text>
                {selectedRoute.majorStops.map(stop => (
                  <View key={stop} style={styles.stopRow}>
                    <Icon name="place" size={16} color={selectedRoute.color} />
                    <Text style={styles.stopText}>{stop}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.84)', marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#263238' },
  recentSection: { paddingHorizontal: 16, marginBottom: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  recentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recentChipText: { color: '#1565C0', fontSize: 12, fontWeight: '700' },
  recentEmpty: { fontSize: 13, color: '#90A4AE' },
  listContent: { padding: 16, paddingBottom: 24 },
  routeCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  routeNumber: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  routeInfo: { flex: 1, marginLeft: 14 },
  destination: { fontSize: 15, color: '#334155', fontWeight: '600' },
  routeMeta: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  modalSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 22,
    marginBottom: 12,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  stopText: { fontSize: 14, color: '#334155' },
});
