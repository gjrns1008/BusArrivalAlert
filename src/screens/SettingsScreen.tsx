import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AdBanner from '../components/AdBanner';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  function openApiKeyGuide() {
    Linking.openURL('https://data.seoul.go.kr');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="notifications-active" size={22} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>푸시 알림</Text>
                <Text style={styles.settingDesc}>버스 도착 전 알림 받기</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#DDD', true: '#90CAF9' }}
              thumbColor={notifications ? '#2196F3' : '#FFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="refresh" size={22} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>자동 새로고침</Text>
                <Text style={styles.settingDesc}>30초마다 자동 갱신</Text>
              </View>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#DDD', true: '#90CAF9' }}
              thumbColor={autoRefresh ? '#2196F3' : '#FFF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API 설정</Text>

          <TouchableOpacity style={styles.infoCard} onPress={openApiKeyGuide}>
            <Icon name="key" size={24} color="#FF9800" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Seoul Open API 키</Text>
              <Text style={styles.infoDesc}>
                서울시 열린데이터광장에서 API 키를 발급받으세요.
                키를 발급받으려면 터미널에서 환경변수를 설정하세요:
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
            <Icon name="info-outline" size={24} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>현재 상태</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#FFF8E1' }]}>
                <Text style={[styles.statusText, { color: '#FF9800' }]}>
                  목업 데이터 사용 중
                </Text>
              </View>
              <Text style={styles.infoDesc}>
                API 키가 설정되면 실제 서울 버스 도착 정보를 가져옵니다.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>

          <View style={styles.infoCard}>
            <Icon name="directions-bus" size={24} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>BusArrivalAlert</Text>
              <Text style={styles.infoDesc}>
                React Native로 만든 실시간 버스 도착 정보 앱
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="code" size={24} color="#9C27B0" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>사용 기술</Text>
              <Text style={styles.infoDesc}>
                React Navigation • React Native 0.84 • TypeScript
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
  content: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  infoDesc: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
    lineHeight: 18,
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#4EC9B0',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
