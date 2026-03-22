/**
 * 서울 버스 도착 정보 API 서비스
 *
 * 사용법:
 * 1. 서울 열린데이터광장(https://data.seoul.go.kr)에서 API 키를 발급받으세요.
 * 2. 발급받은 키를 NEXT_PUBLIC_SEOUL_BUS_API_KEY 환경변수에 설정하세요.
 * 3. API 키가 없으면 목업 데이터로 동작합니다.
 */

const API_KEY = process.env.EXPO_PUBLIC_SEOUL_BUS_API_KEY || '';
const BASE_URL = 'http://ws.bus.go.kr/api/rest/arrive';

// 목업 데이터
const MOCK_STATIONS = [
  { stationId: '122000123', stationName: '역삼동 코오롱아파트', routes: ['462', '2411', 'nw1611'] },
  { stationId: '122000456', stationName: '선릉역 1번출구', routes: ['462', '1400', '360'] },
  { stationId: '122000789', stationName: '도곡동 대우아파트', routes: ['462', '1471', '750A'] },
  { stationId: '122000111', stationName: '삼성역 5번출구', routes: ['51', '62', '740'] },
  { stationId: '122000222', stationName: '논현역 2번출구', routes: ['145', '360', '500'] },
];

const MOCK_ROUTES: Record<string, { busNumber: string; destination: string; color: string }> = {
  '462': { busNumber: '462', destination: '잠실환승센터', color: '#2196F3' },
  '2411': { busNumber: '2411', destination: '강남역', color: '#4CAF50' },
  'nw1611': { busNumber: '1611', destination: '노원역', color: '#FF9800' },
  '1400': { busNumber: '1400', destination: '구로디지털단지역', color: '#9C27B0' },
  '360': { busNumber: '360', destination: '상계동', color: '#F44336' },
  '1471': { busNumber: '1471', destination: '고속버스터미널', color: '#009688' },
  '750A': { busNumber: '750A', destination: '은평구청', color: '#795548' },
  '51': { busNumber: '51', destination: '오금동', color: '#607D8B' },
  '62': { busNumber: '62', destination: '도봉산역', color: '#E91E63' },
  '740': { busNumber: '740', destination: '노량진역', color: '#3F51B5' },
  '145': { busNumber: '145', destination: '양재역', color: '#00BCD4' },
  '500': { busNumber: '500', destination: '남부터미널', color: '#FF5722' },
};

function generateMockArrivals(stationId: string, routeNo: string) {
  const route = MOCK_ROUTES[routeNo];
  const now = Date.now();
  return {
    stationId,
    routeNo,
    busNumber: route?.busNumber || routeNo,
    destination: route?.destination || '목적지',
    routeType: route?.color || '#2196F3',
    arrPrevStation: Math.floor(Math.random() * 15) + 1,
    arrTime: Math.floor(Math.random() * 20) + 1,
    isLast: Math.random() > 0.7,
    isLowFloor: Math.random() > 0.5,
    seatAvailable: Math.floor(Math.random() * 20),
  };
}

export interface BusArrival {
  stationId: string;
  routeNo: string;
  busNumber: string;
  destination: string;
  routeType: string;
  arrPrevStation: number;
  arrTime: number;
  isLast: boolean;
  isLowFloor: boolean;
  seatAvailable: number;
}

export interface Station {
  stationId: string;
  stationName: string;
  routes: string[];
}

// API 키가 없으면 목업 데이터 반환
function isApiConfigured(): boolean {
  return API_KEY.length > 0;
}

export async function getArrivalsByStation(stationId: string): Promise<BusArrival[]> {
  if (!isApiConfigured()) {
    // 목업 데이터 반환
    const station = MOCK_STATIONS.find(s => s.stationId === stationId);
    const routes = station?.routes || ['462', '2411'];
    return routes.map(route => generateMockArrivals(stationId, route));
  }

  try {
    const url = `${BASE_URL}/getArrInfoByRoute?serviceKey=${API_KEY}&stId=${stationId}&resultType=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.msgBody?.itemList) {
      const items = Array.isArray(data.response.msgBody.itemList)
        ? data.response.msgBody.itemList
        : [data.response.msgBody.itemList];

      return items.map((item: any) => ({
        stationId: item.stId,
        routeNo: item.rtNm,
        busNumber: item.rtNm,
        destination: item.destNm,
        routeType: '#2196F3',
        arrPrevStation: parseInt(item.staOrd, 10),
        arrTime: parseInt(item.arrtym, 10) || 0,
        isLast: item.isLast === '1',
        isLowFloor: item.lowPlate === '1',
        seatAvailable: parseInt(item.adjacent, 10) || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('버스 도착 정보 가져오기 실패:', error);
    return [];
  }
}

export async function searchStations(query: string): Promise<Station[]> {
  if (!isApiConfigured()) {
    // 목업 데이터에서 검색
    return MOCK_STATIONS.filter(s =>
      s.stationName.includes(query) || s.routes.some(r => r.includes(query))
    );
  }

  try {
    const url = `${BASE_URL}/getStationByName?serviceKey=${API_KEY}&stSrch=${encodeURIComponent(query)}&resultType=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.msgBody?.itemList) {
      const items = Array.isArray(data.response.msgBody.itemList)
        ? data.response.msgBody.itemList
        : [data.response.msgBody.itemList];

      return items.map((item: any) => ({
        stationId: item.stId,
        stationName: item.stNm,
        routes: item.busRouteList?.split(',') || [],
      }));
    }
    return [];
  } catch (error) {
    console.error('정류소 검색 실패:', error);
    return [];
  }
}

export async function getNearbyStations(lat: number, lng: number): Promise<Station[]> {
  if (!isApiConfigured()) {
    return MOCK_STATIONS;
  }

  try {
    const url = `${BASE_URL}/getStationByPos?serviceKey=${API_KEY}&tmX=${lng}&tmY=${lat}&radius=500&resultType=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.msgBody?.itemList) {
      const items = Array.isArray(data.response.msgBody.itemList)
        ? data.response.msgBody.itemList
        : [data.response.msgBody.itemList];

      return items.map((item: any) => ({
        stationId: item.stId,
        stationName: item.stNm,
        routes: item.busRouteList?.split(',') || [],
      }));
    }
    return [];
  } catch (error) {
    console.error('주변 정류소 검색 실패:', error);
    return [];
  }
}

export { MOCK_STATIONS, MOCK_ROUTES };
