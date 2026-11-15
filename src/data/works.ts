import type { L10n, Work } from '../types';

const ep = (n: number): L10n[] =>
  Array.from({ length: n }, (_, i) => ({
    ko: `${i + 1}화`, en: `Ep. ${i + 1}`, ja: `第${i + 1}話`, zh: `第${i + 1}集`,
  }));

const acts: L10n[] = [
  { ko: '도입', en: 'Opening', ja: '序盤', zh: '开端' },
  { ko: '전개', en: 'Development', ja: '展開', zh: '发展' },
  { ko: '절정', en: 'Climax', ja: 'クライマックス', zh: '高潮' },
  { ko: '결말', en: 'Ending', ja: '結末', zh: '结局' },
];

export const works: Work[] = [
  // ── 드라마 ──
  {
    id: 'goblin', type: 'drama', year: 2016,
    title: { ko: '쓸쓸하고 찬란하神 - 도깨비', en: 'Guardian: The Lonely and Great God (Goblin)', ja: 'トッケビ〜君がくれた愛しい日々〜', zh: '孤单又灿烂的神：鬼怪' },
    aliases: ['도깨비', 'Goblin', 'Dokkaebi', 'トッケビ', '鬼怪'],
    creator: { ko: '김은숙 극본', en: 'Written by Kim Eun-sook', ja: '脚本 キム・ウンスク', zh: '编剧 金恩淑' },
    segments: ep(16),
  },
  {
    id: 'hometown', type: 'drama', year: 2021,
    title: { ko: '갯마을 차차차', en: 'Hometown Cha-Cha-Cha', ja: '海街チャチャチャ', zh: '海岸村恰恰恰' },
    aliases: ['Hometown Cha Cha Cha', 'Gaetmaeul'],
    creator: { ko: '신하은 극본', en: 'Written by Shin Ha-eun', ja: '脚本 シン・ハウン', zh: '编剧 申夏恩' },
    segments: ep(16),
  },
  {
    id: 'woo', type: 'drama', year: 2022,
    title: { ko: '이상한 변호사 우영우', en: 'Extraordinary Attorney Woo', ja: 'ウ・ヨンウ弁護士は天才肌', zh: '非常律师禹英禑' },
    aliases: ['우영우', 'Attorney Woo', 'Woo Young-woo'],
    creator: { ko: '문지원 극본', en: 'Written by Moon Ji-won', ja: '脚本 ムン・ジウォン', zh: '编剧 文智媛' },
    segments: ep(16),
  },
  {
    id: 'camellia', type: 'drama', year: 2019,
    title: { ko: '동백꽃 필 무렵', en: 'When the Camellia Blooms', ja: '椿の花咲く頃', zh: '山茶花开时' },
    aliases: ['동백꽃', 'Camellia'],
    creator: { ko: '임상춘 극본', en: 'Written by Lim Sang-choon', ja: '脚本 イム・サンチュン', zh: '编剧 林尚春' },
    segments: ep(40),
  },
  // ── 영화 ──
  {
    id: 'parasite', type: 'film', year: 2019,
    title: { ko: '기생충', en: 'Parasite', ja: 'パラサイト 半地下の家族', zh: '寄生虫' },
    aliases: ['Gisaengchung'],
    creator: { ko: '봉준호 감독', en: 'Dir. Bong Joon-ho', ja: '監督 ポン・ジュノ', zh: '导演 奉俊昊' },
    segments: acts,
  },
  {
    id: 'attorney', type: 'film', year: 2013,
    title: { ko: '변호인', en: 'The Attorney', ja: '弁護人', zh: '辩护人' },
    aliases: ['Byeonhoin'],
    creator: { ko: '양우석 감독', en: 'Dir. Yang Woo-suk', ja: '監督 ヤン・ウソク', zh: '导演 杨宇硕' },
    segments: acts,
  },
  {
    id: 'odetomyfather', type: 'film', year: 2014,
    title: { ko: '국제시장', en: 'Ode to My Father', ja: '国際市場で逢いましょう', zh: '国际市场' },
    aliases: ['Gukjesijang', 'International Market'],
    creator: { ko: '윤제균 감독', en: 'Dir. Yoon Je-kyoon', ja: '監督 ユン・ジェギュン', zh: '导演 尹济均' },
    segments: acts,
  },
  // ── 문학 ──
  {
    id: 'buckwheat', type: 'literature', year: 1936,
    title: { ko: '메밀꽃 필 무렵', en: 'When the Buckwheat Blooms', ja: 'そばの花の咲く頃', zh: '荞麦花开时' },
    aliases: ['메밀꽃', 'Buckwheat'],
    creator: { ko: '이효석', en: 'Lee Hyo-seok', ja: 'イ・ヒョソク', zh: '李孝石' },
    segments: acts,
  },
  {
    id: 'sonagi', type: 'literature', year: 1953,
    title: { ko: '소나기', en: 'The Rain Shower', ja: 'にわか雨', zh: '雷阵雨' },
    aliases: ['Sonagi', 'Shower'],
    creator: { ko: '황순원', en: 'Hwang Sun-won', ja: 'ファン・スンウォン', zh: '黄顺元' },
    segments: acts,
  },
  {
    id: 'toji', type: 'literature', year: 1969,
    title: { ko: '토지', en: 'Toji (The Land)', ja: '土地', zh: '土地' },
    aliases: ['Toji', 'The Land'],
    creator: { ko: '박경리', en: 'Park Kyong-ni', ja: '朴景利', zh: '朴景利' },
    segments: [
      { ko: '1부', en: 'Part 1', ja: '第1部', zh: '第一部' },
      { ko: '2부', en: 'Part 2', ja: '第2部', zh: '第二部' },
      { ko: '3부', en: 'Part 3', ja: '第3部', zh: '第三部' },
      { ko: '4부', en: 'Part 4', ja: '第4部', zh: '第四部' },
      { ko: '5부', en: 'Part 5', ja: '第5部', zh: '第五部' },
    ],
  },
  {
    id: 'taebaek', type: 'literature', year: 1983,
    title: { ko: '태백산맥', en: 'The Taebaek Mountains', ja: '太白山脈', zh: '太白山脉' },
    aliases: ['Taebaek Sanmaek'],
    creator: { ko: '조정래', en: 'Jo Jung-rae', ja: '趙廷来', zh: '赵廷来' },
    segments: acts,
  },
];
