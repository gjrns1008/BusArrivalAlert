import React from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AdBanner from '../components/AdBanner';
import StatusPill from '../components/StatusPill';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { getApiStatus } from '../services/busApi';

const LANGUAGES = [
  { value: 'ko' as const, label: '한국어' },
  { value: 'en' as const, label: 'English' },
];

export default function SettingsScreen() {
  const { alerts, favoriteStations, recentStations, settings, updateSettings } =
    useAppPreferences();
  const apiStatus = getApiStatus();
  const alertCount = Object.values(alerts).reduce(
    (acc, items) => acc + items.length,
    0,
  );

  function openApiKeyGuide() {
    Linking.openURL('https://data.seoul.go.kr');
  }

  function cycleTime(key: 'morningCommute' | 'eveningCommute') {
    const options =
      key === 'morningCommute'
        ? ['07:00', '07:30', '08:00', '08:30']
        : ['18:00', '18:30', '19:00', '19:30'];
    const currentIndex = options.indexOf(settings[key]);
    const nextValue = options[(currentIndex + 1) % options.length];
    updateSettings({ [key]: nextValue });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>
          알림, 출퇴근 모드, 프리미엄 상태를 관리하세요
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>대시보드</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{favoriteStations.length}</Text>
              <Text style={styles.summaryLabel}>즐겨찾기 정류소</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{recentStations.length}</Text>
              <Text style={styles.summaryLabel}>최근 정류소</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{alertCount}</Text>
              <Text style={styles.summaryLabel}>예약 알림</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 및 자동화</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="notifications-active" size={22} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>푸시 알림</Text>
                <Text style={styles.settingDesc}>
                  도착 알림 예약을 활성화합니다
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={value => updateSettings({ notifications: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="refresh" size={22} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>자동 새로고침</Text>
                <Text style={styles.settingDesc}>
                  도착 화면을 30초마다 갱신합니다
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoRefresh}
              onValueChange={value => updateSettings({ autoRefresh: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="commute" size={22} color="#FF9800" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>출퇴근 모드</Text>
                <Text style={styles.settingDesc}>
                  지정 시간의 즐겨찾기 정류소를 강조합니다
                </Text>
              </View>
            </View>
            <Switch
              value={settings.commuteMode}
              onValueChange={value => updateSettings({ commuteMode: value })}
            />
          </View>

          <View style={styles.timeRow}>
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => cycleTime('morningCommute')}
            >
              <Text style={styles.timeLabel}>출근 시간</Text>
              <Text style={styles.timeValue}>{settings.morningCommute}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => cycleTime('eveningCommute')}
            >
              <Text style={styles.timeLabel}>퇴근 시간</Text>
              <Text style={styles.timeValue}>{settings.eveningCommute}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>확장 기능</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="widgets" size={22} color="#7E57C2" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>위젯 미리보기</Text>
                <Text style={styles.settingDesc}>홈 위젯용 정보 카드 표시</Text>
              </View>
            </View>
            <Switch
              value={settings.widgetPreview}
              onValueChange={value => updateSettings({ widgetPreview: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="workspace-premium" size={22} color="#00897B" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>프리미엄 모드</Text>
                <Text style={styles.settingDesc}>
                  광고를 숨기고 집중 모드로 전환합니다
                </Text>
              </View>
            </View>
            <Switch
              value={settings.premiumEnabled}
              onValueChange={value => updateSettings({ premiumEnabled: value })}
            />
          </View>

          <View style={styles.languageCard}>
            <Text style={styles.settingLabel}>언어</Text>
            <View style={styles.languageRow}>
              {LANGUAGES.map(language => {
                const active = settings.language === language.value;
                return (
                  <TouchableOpacity
                    key={language.value}
                    style={[
                      styles.languageChip,
                      active && styles.languageChipActive,
                    ]}
                    onPress={() => updateSettings({ language: language.value })}
                  >
                    <Text
                      style={[
                        styles.languageChipText,
                        active && styles.languageChipTextActive,
                      ]}
                    >
                      {language.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API 및 앱 정보</Text>

          <TouchableOpacity style={styles.infoCard} onPress={openApiKeyGuide}>
            <Icon name="key" size={24} color="#FF9800" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Seoul Open API 키</Text>
              <Text style={styles.infoDesc}>
                서울시 열린데이터광장에서 API 키를 발급받으세요.
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  EXPO_PUBLIC_SEOUL_BUS_API_KEY=your_api_key_here
                </Text>
              </View>
            </View>
            <Icon name="open-in-new" size={18} color="#999" />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Icon name="cloud-done" size={24} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>데이터 상태</Text>
              <View style={styles.badgeWrap}>
                <StatusPill
                  label={apiStatus.modeLabel}
                  tone={apiStatus.configured ? 'green' : 'orange'}
                />
              </View>
              <Text style={styles.infoDesc}>
                홈 화면에서도 현재 데이터 모드를 바로 확인할 수 있습니다.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="info-outline" size={24} color="#546E7A" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>BusArrivalAlert</Text>
              <Text style={styles.infoDesc}>
                즐겨찾기, 최근 기록, 알림 예약, 노선 상세를 지원하는 버스 도착
                앱
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <AdBanner />
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
  content: { paddingBottom: 100 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  summaryLabel: { fontSize: 12, color: '#64748B', marginTop: 6 },
  settingRow: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingText: { marginLeft: 12, flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  settingDesc: { fontSize: 12, color: '#94A3B8', marginTop: 3, lineHeight: 18 },
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  timeCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 16 },
  timeLabel: { fontSize: 12, color: '#64748B' },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  languageCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 16 },
  languageRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  languageChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  languageChipActive: { backgroundColor: '#1D4ED8' },
  languageChipText: { color: '#475569', fontWeight: '700' },
  languageChipTextActive: { color: '#FFF' },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: { marginLeft: 12, flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  infoDesc: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  codeText: { fontFamily: 'monospace', fontSize: 12, color: '#67E8F9' },
  badgeWrap: { marginTop: 8 },
});
