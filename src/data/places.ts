import type { Place } from '../types';

/**
 * 샘플 데이터입니다. 좌표는 근사값이고 모든 항목이 verified: false 상태입니다.
 * 실제 서비스 전에 좌표·회차·장면 설명을 검수해야 합니다.
 */
export const places: Place[] = [
  // ── 도깨비 ──
  {
    id: 'goblin-yeongjin', workId: 'goblin', kind: 'filming', verified: false,
    name: { ko: '주문진 영진해변 방파제', en: 'Yeongjin Beach Breakwater, Jumunjin', ja: '注文津・領津海辺の防波堤', zh: '注文津领津海边防波堤' },
    address: { ko: '강원 강릉시 주문진읍 교항리', en: 'Jumunjin-eup, Gangneung, Gangwon', ja: '江原道 江陵市 注文津邑', zh: '江原道江陵市注文津邑' },
    lat: 37.8445, lng: 128.8395, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '여주인공이 메밀꽃을 들고 도깨비를 처음 만나는 바닷가 방파제. 드라마 대표 포토존입니다.', en: 'The seaside breakwater where the heroine, holding buckwheat flowers, first meets the goblin. The drama\'s signature photo spot.', ja: 'ヒロインがそばの花を手にトッケビと初めて出会う防波堤。ドラマを代表するフォトスポット。', zh: '女主角手捧荞麦花初遇鬼怪的海边防波堤，是该剧最具代表性的拍照点。' },
  },
  {
    id: 'goblin-deoksugung', workId: 'goblin', kind: 'filming', verified: false,
    name: { ko: '덕수궁 돌담길', en: 'Deoksugung Stonewall Road', ja: '徳寿宮石垣道', zh: '德寿宫石墙路' },
    address: { ko: '서울 중구 정동길', en: 'Jeongdong-gil, Jung-gu, Seoul', ja: 'ソウル 中区 貞洞キル', zh: '首尔中区贞洞路' },
    lat: 37.5658, lng: 126.9745, appearsAt: 1, spoiler: 0,
    descSafe: { ko: '주인공들이 함께 걷는 돌담길. 가을 단풍철에 특히 아름답습니다.', en: 'The stonewall lane the leads stroll along. Especially beautiful in autumn.', ja: '主人公たちが一緒に歩く石垣道。秋の紅葉の季節が特に美しい。', zh: '主角们并肩散步的石墙路，秋季红叶时节尤其美丽。' },
  },
  {
    id: 'goblin-hanmi', workId: 'goblin', kind: 'filming', verified: false,
    name: { ko: '배다리 헌책방거리 한미서점', en: 'Hanmi Bookstore, Baedari Used-Book Street', ja: 'ペダリ古本屋通り・ハンミ書店', zh: '裴达里旧书街韩美书店' },
    address: { ko: '인천 동구 금곡동', en: 'Geumgok-dong, Dong-gu, Incheon', ja: '仁川 東区 金谷洞', zh: '仁川东区金谷洞' },
    lat: 37.4750, lng: 126.6405, appearsAt: 2, spoiler: 0,
    descSafe: { ko: '노란 외벽이 인상적인 헌책방. 극 중 여러 장면의 배경입니다.', en: 'A used-book shop with a striking yellow facade, backdrop for several scenes.', ja: '黄色い外壁が印象的な古本屋。劇中の複数の場面の舞台。', zh: '黄色外墙令人印象深刻的旧书店，剧中多个场景在此拍摄。' },
  },

  // ── 갯마을 차차차 ──
  {
    id: 'hometown-market', workId: 'hometown', kind: 'filming', verified: false,
    name: { ko: '청하공진시장', en: 'Cheongha Gongjin Market', ja: '清河公津市場', zh: '清河公津市场' },
    address: { ko: '경북 포항시 북구 청하면', en: 'Cheongha-myeon, Buk-gu, Pohang, Gyeongbuk', ja: '慶尚北道 浦項市 北区 清河面', zh: '庆尚北道浦项市北区清河面' },
    lat: 36.2005, lng: 129.3425, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '극 중 마을 \'공진\'의 시장 거리. 드라마 속 가게 간판이 남아 있습니다.', en: 'The market street of the fictional village "Gongjin". Some shop signs from the drama remain.', ja: '劇中の村「公津」の市場通り。ドラマの看板が残っています。', zh: '剧中虚构村庄"公津"的市场街，仍保留剧中的店铺招牌。' },
  },
  {
    id: 'hometown-sabang', workId: 'hometown', kind: 'filming', verified: false,
    name: { ko: '사방기념공원', en: 'Sabang Memorial Park', ja: '砂防記念公園', zh: '砂防纪念公园' },
    address: { ko: '경북 포항시 북구 흥해읍', en: 'Heunghae-eup, Buk-gu, Pohang, Gyeongbuk', ja: '慶尚北道 浦項市 北区 興海邑', zh: '庆尚北道浦项市北区兴海邑' },
    lat: 36.1205, lng: 129.4100, appearsAt: 3, spoiler: 0,
    descSafe: { ko: '바다가 내려다보이는 언덕 공원. 주인공들의 산책 장면이 촬영됐습니다.', en: 'A hilltop park overlooking the sea where the leads take a walk.', ja: '海を見下ろす丘の公園。主人公たちの散歩シーンを撮影。', zh: '俯瞰大海的山丘公园，主角散步的场景在此拍摄。' },
  },

  // ── 우영우 ──
  {
    id: 'woo-kimbap', workId: 'woo', kind: 'filming', verified: false,
    name: { ko: '수원 행궁동 \'우영우 김밥\' 촬영지', en: '"Woo Young-woo Kimbap" spot, Haenggung-dong', ja: '水原 行宮洞「ウ・ヨンウのキンパ」ロケ地', zh: '水原行宫洞"禹英禑紫菜包饭"拍摄地' },
    address: { ko: '경기 수원시 팔달구 행궁동', en: 'Haenggung-dong, Paldal-gu, Suwon, Gyeonggi', ja: '京畿道 水原市 八達区 行宮洞', zh: '京畿道水原市八达区行宫洞' },
    lat: 37.2850, lng: 127.0135, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '주인공 아버지가 운영하는 김밥집으로 등장한 곳.', en: 'Appears as the kimbap shop run by the heroine\'s father.', ja: '主人公の父が営むキンパ店として登場。', zh: '剧中女主角父亲经营的紫菜包饭店。' },
  },
  {
    id: 'woo-tree', workId: 'woo', kind: 'filming', verified: false,
    name: { ko: '창원 북부리 팽나무 (소덕동 팽나무)', en: 'Bukbu-ri Hackberry Tree ("Sodeok-dong tree"), Changwon', ja: '昌原 北部里のエノキ（ソドクトンのエノキ）', zh: '昌原北部里朴树（"昭德洞朴树"）' },
    address: { ko: '경남 창원시 의창구 대산면 북부리', en: 'Daesan-myeon, Uichang-gu, Changwon, Gyeongnam', ja: '慶尚南道 昌原市 義昌区 大山面', zh: '庆尚南道昌原市义昌区大山面' },
    lat: 35.3550, lng: 128.7050, appearsAt: 6, spoiler: 1,
    descSafe: { ko: '언덕 위에 홀로 선 오래된 팽나무. 방영 후 천연기념물로 지정됐습니다.', en: 'An ancient hackberry standing alone on a hill, designated a natural monument after the drama aired.', ja: '丘の上に一本立つ古いエノキ。放送後に天然記念物に指定。', zh: '独立于山丘上的古朴树，播出后被指定为天然纪念物。' },
    descFull: { ko: '마을을 관통하는 도로 건설을 둘러싼 소송(7~8화)에서 이 나무의 보호 가치가 핵심 쟁점이 됩니다.', en: 'In the lawsuit over a road through the village (Ep. 7–8), protecting this tree becomes the central issue.', ja: '村を貫く道路建設をめぐる訴訟（7〜8話）で、この木の保護価値が争点に。', zh: '在围绕村庄修路的诉讼（第7–8集）中，这棵树的保护价值成为核心争议。' },
  },

  // ── 동백꽃 필 무렵 ──
  {
    id: 'camellia-guryongpo', workId: 'camellia', kind: 'filming', verified: false,
    name: { ko: '구룡포 일본인가옥거리', en: 'Guryongpo Japanese House Street', ja: '九龍浦 日本人家屋通り', zh: '九龙浦日本人房屋街' },
    address: { ko: '경북 포항시 남구 구룡포읍', en: 'Guryongpo-eup, Nam-gu, Pohang, Gyeongbuk', ja: '慶尚北道 浦項市 南区 九龍浦邑', zh: '庆尚北道浦项市南区九龙浦邑' },
    lat: 35.9895, lng: 129.5560, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '극 중 마을 \'옹산\'의 골목과 술집 \'까멜리아\'가 있던 거리.', en: 'The alleys of the fictional town "Ongsan", home of the bar "Camellia".', ja: '劇中の町「オンサン」の路地と、店「カメリア」があった通り。', zh: '剧中小镇"甕山"的小巷，酒馆"Camellia"所在的街道。' },
  },

  // ── 기생충 ──
  {
    id: 'parasite-supermarket', workId: 'parasite', kind: 'filming', verified: false,
    name: { ko: '돼지쌀슈퍼 (우리슈퍼)', en: 'Woori Supermarket ("Pig Rice Store")', ja: 'ウリスーパー（豚米スーパー）', zh: '猪米超市（Woori超市）' },
    address: { ko: '서울 마포구 아현동', en: 'Ahyeon-dong, Mapo-gu, Seoul', ja: 'ソウル 麻浦区 阿峴洞', zh: '首尔麻浦区阿岘洞' },
    lat: 37.5545, lng: 126.9590, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '영화 초반, 주인공이 친구와 술을 마시는 동네 슈퍼.', en: 'The corner store where the protagonist drinks with a friend early in the film.', ja: '映画序盤、主人公が友人と酒を飲む町のスーパー。', zh: '电影开头主角与朋友喝酒的街角小店。' },
  },
  {
    id: 'parasite-stairs', workId: 'parasite', kind: 'filming', verified: false,
    name: { ko: '자하문 터널 계단', en: 'Jahamun Tunnel Stairs', ja: '紫霞門トンネルの階段', zh: '紫霞门隧道阶梯' },
    address: { ko: '서울 종로구 부암동', en: 'Buam-dong, Jongno-gu, Seoul', ja: 'ソウル 鍾路区 付岩洞', zh: '首尔钟路区付岩洞' },
    lat: 37.5905, lng: 126.9665, appearsAt: 2, spoiler: 1,
    descSafe: { ko: '긴 계단이 이어지는 터널 옆 골목. 영화의 상징적인 장면이 촬영됐습니다.', en: 'An alley of long stairs beside a tunnel, site of one of the film\'s iconic shots.', ja: 'トンネル脇に長い階段が続く路地。映画の象徴的な場面を撮影。', zh: '隧道旁长长的阶梯小巷，电影标志性场景的拍摄地。' },
    descFull: { ko: '폭우가 쏟아지는 밤, 가족이 저택에서 반지하 집까지 계단을 끝없이 내려가는 장면. 계급의 높낮이를 시각화한 장면으로 꼽힙니다.', en: 'On a night of torrential rain, the family descends endless stairs from the mansion to their semi-basement — a visual metaphor for class.', ja: '豪雨の夜、一家が豪邸から半地下の家まで階段を延々と下りる場面。階級の高低を視覚化したとされる。', zh: '暴雨之夜，一家人从豪宅沿阶梯一路走回半地下室，被视为阶级落差的视觉隐喻。' },
  },

  // ── 변호인 ──
  {
    id: 'attorney-huinnyeoul', workId: 'attorney', kind: 'filming', verified: false,
    name: { ko: '흰여울문화마을', en: 'Huinnyeoul Culture Village', ja: 'ヒンヨウル文化村', zh: '白浅滩文化村' },
    address: { ko: '부산 영도구 영선동', en: 'Yeongseon-dong, Yeongdo-gu, Busan', ja: '釜山 影島区 瀛仙洞', zh: '釜山影岛区瀛仙洞' },
    lat: 35.0780, lng: 129.0450, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '바다 절벽 위 골목 마을. 주인공이 살던 집 장면이 촬영됐습니다.', en: 'A cliffside village above the sea; scenes of the protagonist\'s home were shot here.', ja: '海の断崖上の路地の村。主人公の家の場面を撮影。', zh: '海边悬崖上的小巷村落，主角住所的场景在此拍摄。' },
  },

  // ── 국제시장 ──
  {
    id: 'odetomyfather-kkotbuni', workId: 'odetomyfather', kind: 'filming', verified: false,
    name: { ko: '국제시장 꽃분이네', en: 'Kkotbuni\'s Shop, Gukje Market', ja: '国際市場 コップニネ', zh: '国际市场花粉家' },
    address: { ko: '부산 중구 신창동', en: 'Sinchang-dong, Jung-gu, Busan', ja: '釜山 中区 新昌洞', zh: '釜山中区新昌洞' },
    lat: 35.1015, lng: 129.0280, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '주인공 가족이 운영하는 잡화점으로 등장한 가게.', en: 'Appears as the general store run by the protagonist\'s family.', ja: '主人公一家が営む雑貨店として登場。', zh: '剧中主角一家经营的杂货店。' },
  },

  // ── 메밀꽃 필 무렵 (장소 여러 곳 + 핵심 스포일러 예시) ──
  {
    id: 'buckwheat-bongpyeong', workId: 'buckwheat', kind: 'setting', verified: false,
    name: { ko: '봉평장 터 · 이효석문화마을', en: 'Bongpyeong Market Site & Lee Hyo-seok Culture Village', ja: '蓬坪市場跡・イ・ヒョソク文化村', zh: '蓬坪集市旧址・李孝石文化村' },
    address: { ko: '강원 평창군 봉평면', en: 'Bongpyeong-myeon, Pyeongchang, Gangwon', ja: '江原道 平昌郡 蓬坪面', zh: '江原道平昌郡蓬坪面' },
    lat: 37.6110, lng: 128.3620, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '장돌뱅이 허생원이 장사를 마치는 봉평 장터. 9월 메밀꽃 축제가 열립니다.', en: 'The Bongpyeong market where peddler Heo finishes his day. Buckwheat flower festival every September.', ja: '行商人ホ生員が商いを終える蓬坪の市場。9月にそばの花祭り。', zh: '货郎许生员收摊的蓬坪集市，每年九月举办荞麦花节。' },
  },
  {
    id: 'buckwheat-mill', workId: 'buckwheat', kind: 'setting', verified: false,
    name: { ko: '물레방앗간 (복원)', en: 'Water Mill (restored)', ja: '水車小屋（復元）', zh: '水磨坊（复原）' },
    address: { ko: '강원 평창군 봉평면 이효석문화마을', en: 'Lee Hyo-seok Culture Village, Bongpyeong', ja: '蓬坪 イ・ヒョソク文化村内', zh: '蓬坪李孝石文化村内' },
    lat: 37.6150, lng: 128.3600, appearsAt: 1, spoiler: 1,
    descSafe: { ko: '작품 속 물레방앗간을 재현한 곳.', en: 'A recreation of the water mill from the story.', ja: '作品に登場する水車小屋を再現。', zh: '再现作品中水磨坊的地方。' },
    descFull: { ko: '허생원이 평생 잊지 못하는 성서방네 처녀와의 하룻밤을 회상하는 장소.', en: 'Where Heo recalls the one night with the Seong family\'s daughter that he never forgot.', ja: 'ホ生員が生涯忘れられないソン家の娘との一夜を回想する場所。', zh: '许生员回忆与成家姑娘那终生难忘一夜的地方。' },
  },
  {
    id: 'buckwheat-daehwa', workId: 'buckwheat', kind: 'setting', verified: false,
    name: { ko: '대화장 (대화면)', en: 'Daehwa Market', ja: '大和市場', zh: '大和集市' },
    address: { ko: '강원 평창군 대화면', en: 'Daehwa-myeon, Pyeongchang, Gangwon', ja: '江原道 平昌郡 大和面', zh: '江原道平昌郡大和面' },
    lat: 37.5050, lng: 128.4560, appearsAt: 1, spoiler: 0,
    descSafe: { ko: '일행이 달밤에 메밀꽃 핀 산길을 걸어 향하는 다음 장터.', en: 'The next market town the peddlers walk toward on a moonlit mountain path lined with buckwheat.', ja: '一行が月夜にそばの花咲く山道を歩いて向かう次の市場。', zh: '一行人在月夜沿开满荞麦花的山路前往的下一个集市。' },
  },
  {
    id: 'buckwheat-jecheon', workId: 'buckwheat', kind: 'setting', verified: false,
    name: { ko: '제천', en: 'Jecheon', ja: '堤川', zh: '堤川' },
    address: { ko: '충북 제천시', en: 'Jecheon, Chungbuk', ja: '忠清北道 堤川市', zh: '忠清北道堤川市' },
    lat: 37.1326, lng: 128.1910, appearsAt: 3, spoiler: 2,
    descSafe: { ko: '작품 결말부 대화에 등장하는 지명.', en: 'A place name mentioned in the story\'s final conversation.', ja: '作品の結末部の会話に登場する地名。', zh: '作品结尾对话中出现的地名。' },
    descFull: { ko: '동이의 어머니가 제천에 산다는 사실이 밝혀지며, 왼손잡이라는 단서와 함께 동이가 허생원의 아들일 수 있음을 암시합니다.', en: 'It is revealed that Dong-i\'s mother lives in Jecheon — together with his left-handedness, a hint that he may be Heo\'s son.', ja: 'トンイの母が堤川に住むと明かされ、左利きという手がかりと共に、彼がホ生員の息子である可能性を暗示。', zh: '揭示东伊的母亲住在堤川，加上左撇子的线索，暗示他可能是许生员的儿子。' },
  },

  // ── 소나기 ──
  {
    id: 'sonagi-village', workId: 'sonagi', kind: 'memorial', verified: false,
    name: { ko: '황순원문학촌 소나기마을', en: 'Hwang Sun-won Literary Village (Sonagi Village)', ja: 'ファン・スンウォン文学村 にわか雨村', zh: '黄顺元文学村・雷阵雨村' },
    address: { ko: '경기 양평군 서종면 수능리', en: 'Seojong-myeon, Yangpyeong, Gyeonggi', ja: '京畿道 楊平郡 西宗面', zh: '京畿道杨平郡西宗面' },
    lat: 37.5850, lng: 127.3920, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '작품 속 개울가·징검다리·수숫단 등을 재현한 문학 테마파크. 정해진 시간에 인공 소나기가 내립니다.', en: 'A literary theme park recreating the stream, stepping stones and sorghum stacks. An artificial rain shower falls at set times.', ja: '小川・飛び石・ススキの束などを再現した文学テーマパーク。決まった時間に人工のにわか雨が降る。', zh: '再现小溪、踏石、高粱垛等场景的文学主题公园，定时降下人工阵雨。' },
  },

  // ── 토지 ──
  {
    id: 'toji-choi', workId: 'toji', kind: 'setting', verified: false,
    name: { ko: '최참판댁', en: 'Choi Champan\'s House', ja: '崔参判宅', zh: '崔参判宅' },
    address: { ko: '경남 하동군 악양면 평사리', en: 'Pyeongsa-ri, Agyang-myeon, Hadong, Gyeongnam', ja: '慶尚南道 河東郡 岳陽面 平沙里', zh: '庆尚南道河东郡岳阳面平沙里' },
    lat: 35.1880, lng: 127.6460, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '소설 1부의 주 무대인 평사리 최참판 가문의 집을 재현한 한옥 단지.', en: 'A hanok complex recreating the Choi family estate in Pyeongsa-ri, the main stage of Part 1.', ja: '小説第1部の主舞台、平沙里の崔参判家を再現した韓屋群。', zh: '再现小说第一部主舞台平沙里崔参判家族宅邸的韩屋群。' },
  },
  {
    id: 'toji-tongyeong', workId: 'toji', kind: 'memorial', verified: false,
    name: { ko: '박경리기념관 (통영)', en: 'Park Kyong-ni Memorial Hall, Tongyeong', ja: '朴景利記念館（統営）', zh: '朴景利纪念馆（统营）' },
    address: { ko: '경남 통영시 산양읍', en: 'Sanyang-eup, Tongyeong, Gyeongnam', ja: '慶尚南道 統営市 山陽邑', zh: '庆尚南道统营市山阳邑' },
    lat: 34.8160, lng: 128.4050, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '작가의 고향 통영에 있는 기념관과 묘소.', en: 'Memorial hall and grave in the author\'s hometown.', ja: '作家の故郷・統営にある記念館と墓所。', zh: '位于作家故乡统营的纪念馆与墓地。' },
  },

  // ── 태백산맥 ──
  {
    id: 'taebaek-museum', workId: 'taebaek', kind: 'memorial', verified: false,
    name: { ko: '태백산맥문학관', en: 'Taebaek Mountains Literary Museum', ja: '太白山脈文学館', zh: '太白山脉文学馆' },
    address: { ko: '전남 보성군 벌교읍', en: 'Beolgyo-eup, Boseong, Jeonnam', ja: '全羅南道 宝城郡 筏橋邑', zh: '全罗南道宝城郡筏桥邑' },
    lat: 34.8430, lng: 127.3360, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '소설의 주 무대 벌교에 세워진 문학관. 육필 원고가 전시돼 있습니다.', en: 'Museum in Beolgyo, the novel\'s main setting, displaying the handwritten manuscript.', ja: '小説の主舞台・筏橋に建つ文学館。直筆原稿を展示。', zh: '建于小说主舞台筏桥的文学馆，展出手写原稿。' },
  },
  {
    id: 'taebaek-hyeon', workId: 'taebaek', kind: 'setting', verified: false,
    name: { ko: '현부자네 집 · 소화의 집', en: 'Hyeon Family House & Sohwa\'s House', ja: '玄富者の家・ソファの家', zh: '玄富翁家・素花之家' },
    address: { ko: '전남 보성군 벌교읍 회정리', en: 'Hoejeong-ri, Beolgyo-eup, Boseong', ja: '宝城郡 筏橋邑 会亭里', zh: '宝城郡筏桥邑会亭里' },
    lat: 34.8435, lng: 127.3345, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '소설 첫 장면의 무대인 한옥과, 무녀의 딸 소화가 살던 초가.', en: 'The hanok of the novel\'s opening scene and the thatched house of Sohwa, a shaman\'s daughter.', ja: '小説冒頭の舞台となる韓屋と、巫女の娘ソファが住む藁葺き家。', zh: '小说开篇场景的韩屋，以及巫女之女素花居住的草屋。' },
  },
  {
    id: 'taebaek-hongyo', workId: 'taebaek', kind: 'setting', verified: false,
    name: { ko: '벌교 홍교', en: 'Beolgyo Hongyo Bridge', ja: '筏橋 虹橋', zh: '筏桥虹桥' },
    address: { ko: '전남 보성군 벌교읍', en: 'Beolgyo-eup, Boseong, Jeonnam', ja: '全羅南道 宝城郡 筏橋邑', zh: '全罗南道宝城郡筏桥邑' },
    lat: 34.8440, lng: 127.3445, appearsAt: 0, spoiler: 0,
    descSafe: { ko: '조선시대 무지개 돌다리(보물). 소설 속 벌교 읍내의 상징입니다.', en: 'A Joseon-era arched stone bridge (Treasure), symbol of Beolgyo town in the novel.', ja: '朝鮮時代のアーチ型石橋（宝物）。小説の筏橋の象徴。', zh: '朝鲜时代彩虹石桥（宝物），小说中筏桥镇的象征。' },
  },
  {
    id: 'taebaek-sohwa-bridge', workId: 'taebaek', kind: 'setting', verified: false,
    name: { ko: '소화다리 (부용교)', en: 'Sohwa Bridge (Buyonggyo)', ja: 'ソファ橋（芙蓉橋）', zh: '昭和桥（芙蓉桥）' },
    address: { ko: '전남 보성군 벌교읍', en: 'Beolgyo-eup, Boseong, Jeonnam', ja: '全羅南道 宝城郡 筏橋邑', zh: '全罗南道宝城郡筏桥邑' },
    lat: 34.8455, lng: 127.3415, appearsAt: 1, spoiler: 1,
    descSafe: { ko: '일제강점기에 놓인 다리. 소설 속 중요한 사건의 무대입니다.', en: 'A bridge built under Japanese rule; stage of key events in the novel.', ja: '日本統治期に架けられた橋。小説の重要な事件の舞台。', zh: '日据时期修建的桥，小说中重要事件的舞台。' },
    descFull: { ko: '좌우 대립 속에서 양측에 의한 처형이 반복되며 피로 물든 비극의 현장으로 그려집니다.', en: 'Depicted as a site of tragedy where both sides of the ideological conflict carry out repeated executions.', ja: '左右対立の中で双方による処刑が繰り返される悲劇の現場として描かれる。', zh: '在左右对立中双方反复处决他人，被描写为血染的悲剧现场。' },
  },
  {
    id: 'taebaek-yuleo', workId: 'taebaek', kind: 'setting', verified: false,
    name: { ko: '율어면 (율어 해방구)', en: 'Yuleo-myeon ("Yuleo liberated zone")', ja: '栗於面（栗於解放区）', zh: '栗於面（栗於解放区）' },
    address: { ko: '전남 보성군 율어면', en: 'Yuleo-myeon, Boseong, Jeonnam', ja: '全羅南道 宝城郡 栗於面', zh: '全罗南道宝城郡栗於面' },
    lat: 34.8070, lng: 127.2280, appearsAt: 2, spoiler: 1,
    descSafe: { ko: '산으로 둘러싸인 분지 마을. 소설 중반 이후 주요 무대입니다.', en: 'A basin village ringed by mountains, a major setting from the middle of the novel.', ja: '山に囲まれた盆地の村。小説中盤以降の主な舞台。', zh: '群山环绕的盆地村庄，小说中段之后的主要舞台。' },
    descFull: { ko: '빨치산이 장악해 \'해방구\'를 세우는 곳으로 그려집니다.', en: 'Portrayed as where partisans seize control and establish a "liberated zone".', ja: 'パルチザンが掌握し「解放区」を築く場所として描かれる。', zh: '被描写为游击队占领并建立"解放区"的地方。' },
  },
];
