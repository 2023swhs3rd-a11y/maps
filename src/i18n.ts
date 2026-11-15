import type { L10n, Lang } from './types';

export const tr = (l: L10n | undefined, lang: Lang) => (l ? l[lang] ?? l.en : '');

type Full = { ko: string; en: string; ja: string; zh: string };

const S = {
  appName: { ko: '씬맵', en: 'SceneMap', ja: 'シーンマップ', zh: '场景地图' },
  tagline: { ko: '작품 속 그 장소로', en: 'Visit places from stories', ja: '物語のあの場所へ', zh: '去故事里的那个地方' },
  searchPh: { ko: '작품, 장소, 작가 검색', en: 'Search titles, places, creators', ja: '作品・場所・作者を検索', zh: '搜索作品、地点、作者' },
  clear: { ko: '지우기', en: 'Clear', ja: 'クリア', zh: '清除' },
  all: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部' },
  drama: { ko: '드라마', en: 'Drama', ja: 'ドラマ', zh: '电视剧' },
  film: { ko: '영화', en: 'Film', ja: '映画', zh: '电影' },
  literature: { ko: '문학', en: 'Literature', ja: '文学', zh: '文学' },
  placesN: { ko: '장소 {n}곳', en: '{n} places', ja: '{n}か所', zh: '{n}处地点' },
  statPlaces: { ko: '곳의 장소', en: 'places', ja: 'か所', zh: '处地点' },
  statRegions: { ko: '개 시·군', en: 'cities & counties', ja: '市・郡', zh: '个市郡' },
  multi: { ko: '여러 장소', en: 'Multi-stop', ja: '複数の場所', zh: '多处地点' },
  hiddenN: { ko: '스포일러 장소 {n}곳은 숨겨져 있어요', en: '{n} spoiler place(s) hidden', ja: 'ネタバレ場所{n}か所を非表示中', zh: '已隐藏{n}处剧透地点' },
  hiddenHint: { ko: '진행도를 올리면 공개됩니다', en: 'Update your progress to reveal', ja: '進行度を上げると公開されます', zh: '更新观看进度即可显示' },
  progress: { ko: '어디까지 봤나요?', en: 'How far are you?', ja: 'どこまで見ましたか？', zh: '看到哪里了？' },
  progressRead: { ko: '어디까지 읽었나요?', en: 'How far have you read?', ja: 'どこまで読みましたか？', zh: '读到哪里了？' },
  notYet: { ko: '아직 안 봤어요', en: 'Not started', ja: 'まだ', zh: '还没开始' },
  done: { ko: '끝까지 봤어요', en: 'Finished', ja: '最後まで', zh: '已看完' },
  upTo: { ko: '{s}까지', en: 'Up to {s}', ja: '{s}まで', zh: '到{s}' },
  spoilerOn: { ko: '스포일러 보호', en: 'Spoiler shield', ja: 'ネタバレ防止', zh: '防剧透' },
  spoilerOff: { ko: '스포일러 허용', en: 'Spoilers on', ja: 'ネタバレ表示', zh: '显示剧透' },
  spoilerTap: { ko: '스포일러가 있어요 · 탭해서 보기', en: 'Contains spoilers · tap to reveal', ja: 'ネタバレあり・タップで表示', zh: '含剧透 · 点击查看' },
  lockedDetail: { ko: '{s}까지 보면 이 장소의 이야기가 공개돼요', en: 'The story behind this place unlocks after {s}', ja: '{s}まで見るとこの場所の物語が公開されます', zh: '看到{s}后解锁此地的故事' },
  appears: { ko: '{s} 등장', en: 'Appears in {s}', ja: '{s}に登場', zh: '出现于{s}' },
  directions: { ko: '길찾기', en: 'Directions', ja: '経路', zh: '路线' },
  kakao: { ko: '카카오맵', en: 'KakaoMap', ja: 'カカオマップ', zh: 'Kakao地图' },
  naver: { ko: '네이버 지도', en: 'Naver Map', ja: 'NAVER地図', zh: 'Naver地图' },
  google: { ko: '구글 지도', en: 'Google Maps', ja: 'Googleマップ', zh: '谷歌地图' },
  mapTip: { ko: '한국에서는 카카오맵·네이버 지도의 길찾기가 가장 정확해요.', en: 'In Korea, KakaoMap and Naver Map give the most accurate directions.', ja: '韓国ではカカオマップ・NAVER地図の経路案内が最も正確です。', zh: '在韩国，Kakao地图和Naver地图的导航最准确。' },
  share: { ko: '공유', en: 'Share', ja: '共有', zh: '分享' },
  copied: { ko: '링크를 복사했어요', en: 'Link copied', ja: 'リンクをコピーしました', zh: '链接已复制' },
  copyAddr: { ko: '주소 복사', en: 'Copy address', ja: '住所をコピー', zh: '复制地址' },
  addrCopied: { ko: '주소를 복사했어요', en: 'Address copied', ja: '住所をコピーしました', zh: '地址已复制' },
  back: { ko: '뒤로', en: 'Back', ja: '戻る', zh: '返回' },
  close: { ko: '닫기', en: 'Close', ja: '閉じる', zh: '关闭' },
  nearMe: { ko: '내 주변', en: 'Near me', ja: '周辺', zh: '附近' },
  nearCta: { ko: '지금 있는 곳 근처의 작품 속 장소 찾기', en: 'Find story places near you', ja: '近くの作品の舞台を探す', zh: '查找你附近的作品地点' },
  locate: { ko: '내 위치', en: 'My location', ja: '現在地', zh: '我的位置' },
  zoomIn: { ko: '확대', en: 'Zoom in', ja: '拡大', zh: '放大' },
  zoomOut: { ko: '축소', en: 'Zoom out', ja: '縮小', zh: '缩小' },
  locating: { ko: '위치를 확인하고 있어요…', en: 'Finding your location…', ja: '現在地を確認中…', zh: '正在定位…' },
  locFail: { ko: '위치를 가져올 수 없어 서울시청 기준으로 보여드려요', en: 'Location unavailable — showing results around Seoul City Hall', ja: '位置情報を取得できないため、ソウル市庁周辺を表示します', zh: '无法获取位置，显示首尔市厅周边' },
  radius: { ko: '반경', en: 'Radius', ja: '半径', zh: '半径' },
  nearbyTitle: { ko: '가까운 장소 {n}곳', en: '{n} places nearby', ja: '近くの場所 {n}か所', zh: '附近{n}处地点' },
  noNearby: { ko: '이 반경 안에는 아직 장소가 없어요', en: 'No places within this radius yet', ja: 'この範囲にはまだ場所がありません', zh: '此范围内暂无地点' },
  widen: { ko: '반경 넓히기', en: 'Widen search', ja: '範囲を広げる', zh: '扩大范围' },
  noResult: { ko: '"{q}"에 맞는 결과가 없어요', en: 'No results for "{q}"', ja: '「{q}」の検索結果はありません', zh: '没有"{q}"的结果' },
  noResultHint: { ko: '작품의 다른 이름이나 초성(예: ㄱㅅㅊ)으로도 찾을 수 있어요', en: 'Try another title or the original Korean name', ja: '別のタイトルや韓国語の原題でもお試しください', zh: '试试其他名称或韩文原名' },
  works: { ko: '작품', en: 'Titles', ja: '作品', zh: '作品' },
  places: { ko: '장소', en: 'Places', ja: '場所', zh: '地点' },
  browse: { ko: '작품 둘러보기', en: 'Browse titles', ja: '作品を見る', zh: '浏览作品' },
  unverified: { ko: '위치 정보 확인 중 · 실제와 다를 수 있어요', en: 'Location not yet verified', ja: '位置情報は確認中です', zh: '位置信息待核实' },
  filming: { ko: '촬영지', en: 'Filming location', ja: 'ロケ地', zh: '拍摄地' },
  setting: { ko: '작품 배경지', en: 'Story setting', ja: '作品の舞台', zh: '故事背景地' },
  memorial: { ko: '문학관·기념관', en: 'Museum / memorial', ja: '文学館・記念館', zh: '文学馆・纪念馆' },
  routeHint: { ko: '지도의 번호는 작품 속 등장 순서예요', en: 'Map numbers follow story order', ja: '地図の番号は作品での登場順です', zh: '地图编号为作品中的出场顺序' },
  viewWork: { ko: '이 작품의 다른 장소', en: 'More from this title', ja: 'この作品の他の場所', zh: '该作品的其他地点' },
  away: { ko: '여기서 {d}', en: '{d} away', ja: 'ここから{d}', zh: '距此{d}' },
  synopsis: { ko: '소개', en: 'About', ja: 'あらすじ', zh: '简介' },
  cast: { ko: '출연', en: 'Cast', ja: 'キャスト', zh: '演员' },
  watchOn: { ko: '볼 수 있는 곳 (한국)', en: 'Where to watch (Korea)', ja: '視聴できるサービス（韓国）', zh: '观看平台（韩国）' },
  providerNote: { ko: '스트리밍 정보: JustWatch 제공 · 변동될 수 있어요', en: 'Streaming data by JustWatch · may change', ja: '配信情報：JustWatch提供・変更の可能性あり', zh: '流媒体信息由JustWatch提供，可能变动' },
  moreOnTmdb: { ko: 'TMDB에서 더 보기', en: 'More on TMDB', ja: 'TMDBで詳しく見る', zh: '在TMDB查看更多' },
  episodesN: { ko: '{n}부작', en: '{n} episodes', ja: '全{n}話', zh: '共{n}集' },
  minutesN: { ko: '{n}분', en: '{n} min', ja: '{n}分', zh: '{n}分钟' },
  photoBy: { ko: '사진: 한국관광공사', en: 'Photo: Korea Tourism Organization', ja: '写真：韓国観光公社', zh: '图片：韩国观光公社' },
  coordsOfficial: { ko: '한국관광공사 공식 위치 기준', en: 'Location from Korea Tourism Organization', ja: '韓国観光公社の公式位置', zh: '位置来自韩国观光公社' },
  sources: { ko: '정보 출처', en: 'Data sources', ja: 'データ出典', zh: '数据来源' },
  srcMap: { ko: '지도', en: 'Map', ja: '地図', zh: '地图' },
  srcWorks: { ko: '작품 정보·포스터', en: 'Titles & posters', ja: '作品情報・ポスター', zh: '作品信息・海报' },
  srcStreaming: { ko: '스트리밍', en: 'Streaming', ja: '配信', zh: '流媒体' },
  srcPlaces: { ko: '장소 사진·위치', en: 'Place photos & locations', ja: '場所の写真・位置', zh: '地点照片・位置' },
  kto: { ko: '한국관광공사', en: 'Korea Tourism Organization', ja: '韓国観光公社', zh: '韩国观光公社' },
  language: { ko: '언어', en: 'Language', ja: '言語', zh: '语言' },
} satisfies Record<string, Full>;

export type Key = keyof typeof S;

export function t(key: Key, lang: Lang, vars: Record<string, string | number> = {}) {
  let s: string = S[key][lang];
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '简体中文' };
export const LANG_SHORT: Record<Lang, string> = { ko: '한', en: 'EN', ja: '日', zh: '中' };
