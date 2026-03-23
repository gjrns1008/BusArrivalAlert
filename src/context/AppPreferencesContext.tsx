import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Station, RouteSummary } from '../services/busApi';

const STORAGE_KEY = '@bus_arrival_alert/preferences';
const MAX_RECENT_STATIONS = 6;
const MAX_RECENT_ROUTES = 8;

export interface FavoriteStation extends Station {
  savedAt: string;
}

export interface RecentStation extends Station {
  viewedAt: string;
}

export interface RecentRoute extends RouteSummary {
  viewedAt: string;
}

export interface AppSettings {
  notifications: boolean;
  autoRefresh: boolean;
  premiumEnabled: boolean;
  commuteMode: boolean;
  morningCommute: string;
  eveningCommute: string;
  language: 'ko' | 'en';
  widgetPreview: boolean;
}

interface StoredPreferences {
  favoriteStations: FavoriteStation[];
  recentStations: RecentStation[];
  recentRoutes: RecentRoute[];
  alerts: Record<string, number[]>;
  settings: AppSettings;
}

interface AppPreferencesContextValue extends StoredPreferences {
  hydrated: boolean;
  toggleFavoriteStation: (station: Station) => void;
  isFavoriteStation: (stationId: string) => boolean;
  addRecentStation: (station: Station) => void;
  addRecentRoute: (route: RouteSummary) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleAlertMinute: (
    stationId: string,
    routeNo: string,
    minute: number,
  ) => void;
  getAlertMinutes: (stationId: string, routeNo: string) => number[];
}

const defaultSettings: AppSettings = {
  notifications: true,
  autoRefresh: true,
  premiumEnabled: false,
  commuteMode: false,
  morningCommute: '07:30',
  eveningCommute: '18:30',
  language: 'ko',
  widgetPreview: true,
};

const defaultValue: AppPreferencesContextValue = {
  hydrated: false,
  favoriteStations: [],
  recentStations: [],
  recentRoutes: [],
  alerts: {},
  settings: defaultSettings,
  toggleFavoriteStation: () => {},
  isFavoriteStation: () => false,
  addRecentStation: () => {},
  addRecentRoute: () => {},
  updateSettings: () => {},
  toggleAlertMinute: () => {},
  getAlertMinutes: () => [],
};

const AppPreferencesContext =
  createContext<AppPreferencesContextValue>(defaultValue);

function sortByDateDesc<T extends { viewedAt?: string; savedAt?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.viewedAt ?? a.savedAt ?? 0).getTime();
    const bTime = new Date(b.viewedAt ?? b.savedAt ?? 0).getTime();
    return bTime - aTime;
  });
}

export function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>(
    [],
  );
  const [recentStations, setRecentStations] = useState<RecentStation[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([]);
  const [alerts, setAlerts] = useState<Record<string, number[]>>({});
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
          setFavoriteStations(parsed.favoriteStations ?? []);
          setRecentStations(parsed.recentStations ?? []);
          setRecentRoutes(parsed.recentRoutes ?? []);
          setAlerts(parsed.alerts ?? {});
          setSettings({ ...defaultSettings, ...(parsed.settings ?? {}) });
        }
      } catch (error) {
        console.warn('Failed to load app preferences', error);
      } finally {
        setHydrated(true);
      }
    }

    loadPreferences();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const payload: StoredPreferences = {
      favoriteStations,
      recentStations,
      recentRoutes,
      alerts,
      settings,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(error => {
      console.warn('Failed to persist app preferences', error);
    });
  }, [
    alerts,
    favoriteStations,
    hydrated,
    recentRoutes,
    recentStations,
    settings,
  ]);

  const toggleFavoriteStation = useCallback((station: Station) => {
    setFavoriteStations(current => {
      const exists = current.some(item => item.stationId === station.stationId);
      if (exists) {
        return current.filter(item => item.stationId !== station.stationId);
      }

      return sortByDateDesc([
        { ...station, savedAt: new Date().toISOString() },
        ...current.filter(item => item.stationId !== station.stationId),
      ]);
    });
  }, []);

  const isFavoriteStation = useCallback(
    (stationId: string) =>
      favoriteStations.some(item => item.stationId === stationId),
    [favoriteStations],
  );

  const addRecentStation = useCallback((station: Station) => {
    setRecentStations(current => {
      const next = sortByDateDesc([
        { ...station, viewedAt: new Date().toISOString() },
        ...current.filter(item => item.stationId !== station.stationId),
      ]);
      return next.slice(0, MAX_RECENT_STATIONS);
    });
  }, []);

  const addRecentRoute = useCallback((route: RouteSummary) => {
    setRecentRoutes(current => {
      const next = sortByDateDesc([
        { ...route, viewedAt: new Date().toISOString() },
        ...current.filter(item => item.routeNo !== route.routeNo),
      ]);
      return next.slice(0, MAX_RECENT_ROUTES);
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(current => ({ ...current, ...patch }));
  }, []);

  const toggleAlertMinute = useCallback(
    (stationId: string, routeNo: string, minute: number) => {
      const key = `${stationId}:${routeNo}`;
      setAlerts(current => {
        const existing = current[key] ?? [];
        const nextMinutes = existing.includes(minute)
          ? existing.filter(item => item !== minute)
          : [...existing, minute].sort((a, b) => a - b);

        return {
          ...current,
          [key]: nextMinutes,
        };
      });
    },
    [],
  );

  const getAlertMinutes = useCallback(
    (stationId: string, routeNo: string) =>
      alerts[`${stationId}:${routeNo}`] ?? [],
    [alerts],
  );

  const value = useMemo(
    () => ({
      hydrated,
      favoriteStations,
      recentStations,
      recentRoutes,
      alerts,
      settings,
      toggleFavoriteStation,
      isFavoriteStation,
      addRecentStation,
      addRecentRoute,
      updateSettings,
      toggleAlertMinute,
      getAlertMinutes,
    }),
    [
      addRecentRoute,
      addRecentStation,
      alerts,
      favoriteStations,
      getAlertMinutes,
      hydrated,
      isFavoriteStation,
      recentRoutes,
      recentStations,
      settings,
      toggleAlertMinute,
      toggleFavoriteStation,
      updateSettings,
    ],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  return useContext(AppPreferencesContext);
}
