import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import StatusPill from '../components/StatusPill';
import AdBanner from '../components/AdBanner';
import { useAppPreferences } from '../context/AppPreferencesContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getApiStatus, searchStations, Station } from '../services/busApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    addRecentStation,
    favoriteStations,
    isFavoriteStation,
    recentStations,
    settings,
    toggleFavoriteStation,
  } = useAppPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const apiStatus = getApiStatus();

  const loadDefaultStations = useCallback(async () => {
    setLoading(true);
    const keyword = favoriteStations[0]?.stationName.slice(0, 2) || '역삼';
    const results = await searchStations(keyword);
    setStations(results);
    setLoading(false);
  }, [favoriteStations]);

  useEffect(() => {
    loadDefaultStations();
  }, [loadDefaultStations]);

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
    addRecentStation(station);
    navigation.navigate('Arrival', {
      stationId: station.stationId,
      stationName: station.stationName,
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDefaultStations();
    setRefreshing(false);
  }

  const sections = useMemo(
    () => [
      {
        key: 'favorites',
        title: '즐겨찾기 정류소',
        subtitle: '자주 보는 정류소를 한 번에 확인하세요.',
        items: favoriteStations,
        emptyText: '아직 즐겨찾기 정류소가 없습니다.',
      },
      {
        key: 'recent',
        title: '최근 본 정류소',
        subtitle: '최근에 확인한 정류소가 여기에 쌓입니다.',
        items: recentStations,
        emptyText: '최근 본 정류소가 없습니다.',
      },
    ],
    [favoriteStations, recentStations],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={stations}
        keyExtractor={item => item.stationId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>버스 도착 정보</Text>
              <Text style={styles.subtitle}>
                즐겨찾기, 최근 조회, 출퇴근 모드를 한 번에 관리하세요
              </Text>

              <View style={styles.headerRow}>
                <StatusPill
                  label={apiStatus.modeLabel}
                  tone={apiStatus.configured ? 'green' : 'orange'}
                />
                {settings.commuteMode && (
                  <StatusPill label="출퇴근 모드 ON" tone="blue" />
                )}
              </View>

              <View style={styles.commuteCard}>
                <Icon name="schedule" size={18} color="#1565C0" />
                <Text style={styles.commuteText}>
                  출근 {settings.morningCommute} · 퇴근{' '}
                  {settings.eveningCommute}
                </Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
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

            {sections.map(section => (
              <View key={section.key} style={styles.quickSection}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                {section.items.length === 0 ? (
                  <View style={styles.emptyMiniCard}>
                    <Text style={styles.emptyMiniText}>
                      {section.emptyText}
                    </Text>
                  </View>
                ) : (
                  section.items.map(item => (
                    <TouchableOpacity
                      key={`${section.key}-${item.stationId}`}
                      style={styles.quickCard}
                      onPress={() => handleStationPress(item)}
                    >
                      <View style={styles.quickCardMain}>
                        <Text style={styles.quickCardTitle}>
                          {item.stationName}
                        </Text>
                        <Text style={styles.quickCardMeta}>
                          {item.routes.slice(0, 3).join(' · ')}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={20} color="#90A4AE" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ))}

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>검색 결과</Text>
              <Text style={styles.resultsCount}>{stations.length}개</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Icon name="travel-explore" size={56} color="#CFD8DC" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? '검색 결과가 없습니다.'
                  : '검색어를 입력하면 정류소를 찾을 수 있습니다.'}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const favorite = isFavoriteStation(item.stationId);

          return (
            <TouchableOpacity
              style={styles.stationCard}
              onPress={() => handleStationPress(item)}
            >
              <View style={styles.stationHeader}>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{item.stationName}</Text>
                  <Text style={styles.stationId}>
                    정류소 ID {item.stationId}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleFavoriteStation(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name={favorite ? 'star' : 'star-border'}
                    size={24}
                    color={favorite ? '#FFC107' : '#B0BEC5'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.routeContainer}>
                {item.routes.slice(0, 6).map(route => (
                  <View key={route} style={styles.routeChip}>
                    <Text style={styles.routeChipText}>
                      {route.replace('nw', '')}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<AdBanner />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.86)',
    marginTop: 6,
    lineHeight: 20,
  },
  headerRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  commuteCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commuteText: { color: '#EAF4FF', fontSize: 13, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#263238' },
  quickSection: { marginTop: 18, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 10,
  },
  emptyMiniCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14 },
  emptyMiniText: { color: '#90A4AE', fontSize: 13 },
  quickCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCardMain: { flex: 1 },
  quickCardTitle: { fontSize: 15, fontWeight: '700', color: '#263238' },
  quickCardMeta: { fontSize: 12, color: '#78909C', marginTop: 4 },
  resultsHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  resultsCount: { fontSize: 13, color: '#78909C' },
  centerContainer: {
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#90A4AE',
    textAlign: 'center',
  },
  listContent: { paddingBottom: 24 },
  stationCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  stationHeader: { flexDirection: 'row', alignItems: 'center' },
  stationInfo: { flex: 1, marginRight: 12 },
  stationName: { fontSize: 16, fontWeight: '700', color: '#263238' },
  stationId: { fontSize: 12, color: '#90A4AE', marginTop: 4 },
  routeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  routeChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  routeChipText: { color: '#1565C0', fontSize: 12, fontWeight: '700' },
});
