import { useEffect, useRef } from 'react';
import type { Lang } from '../types';
import { LANGS } from '../types';
import { LANG_LABEL } from '../i18n';

// 언어 선택 화면은 어떤 언어 사용자도 읽을 수 있도록 네 언어를 함께 씁니다.
const PROMPT: Record<Lang, string> = {
  ko: '언어를 선택하세요',
  en: 'Choose your language',
  ja: '言語を選択してください',
  zh: '请选择语言',
};
const SUB: Record<Lang, string> = {
  ko: '드라마·영화·문학 속 장소를 지도에서',
  en: 'Places from K-dramas, films & literature',
  ja: 'ドラマ・映画・文学の舞台を地図で',
  zh: '在地图上探索剧集、电影和文学中的地点',
};
const SUGGESTED: Record<Lang, string> = { ko: '추천', en: 'Suggested', ja: 'おすすめ', zh: '推荐' };
const CHANGE_LATER: Record<Lang, string> = {
  ko: '언제든 오른쪽 위 🌐 버튼으로 바꿀 수 있어요',
  en: 'You can change it anytime with the 🌐 button at the top',
  ja: '右上の🌐ボタンからいつでも変更できます',
  zh: '随时可通过右上角🌐按钮更改',
};

export function GlobeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function LangPicker({ current, detected, firstVisit, onChoose, onClose }: {
  current: Lang;
  detected: Lang;
  firstVisit: boolean;
  onChoose: (l: Lang) => void;
  onClose: () => void;
}) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !firstVisit) onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [firstVisit, onClose]);

  // 감지된 언어를 맨 위에 둡니다
  const order = [detected, ...LANGS.filter((l) => l !== detected)];
  const shown = firstVisit ? detected : current;

  return (
    <div className="lp-backdrop" onClick={() => !firstVisit && onClose()}>
      <div className="lp" role="dialog" aria-modal="true" aria-labelledby="lp-title" onClick={(e) => e.stopPropagation()}>
        <div className="lp-head">
          <img src="./icon.svg" alt="" width={44} height={44} />
          <div>
            <strong>씬맵 SceneMap</strong>
            <small>{SUB[shown]}</small>
          </div>
        </div>
        <h2 id="lp-title" className="lp-title"><GlobeIcon size={20} />{PROMPT[shown]}</h2>
        <p className="lp-multi" aria-hidden>
          {LANGS.filter((l) => l !== shown).map((l) => PROMPT[l]).join(' · ')}
        </p>
        <div className="lp-options">
          {order.map((l, i) => (
            <button
              key={l}
              ref={i === 0 ? first : undefined}
              lang={l === 'zh' ? 'zh-CN' : l}
              className={`lp-opt ${l === current && !firstVisit ? 'on' : ''}`}
              onClick={() => onChoose(l)}
            >
              <span className="lp-name">{LANG_LABEL[l]}</span>
              {l === detected && <span className="lp-badge">{SUGGESTED[l]}</span>}
              {l === current && !firstVisit && <span className="lp-check">✓</span>}
            </button>
          ))}
        </div>
        <p className="lp-foot">{CHANGE_LATER[shown]}</p>
      </div>
    </div>
  );
}
