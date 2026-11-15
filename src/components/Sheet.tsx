import { useEffect, useRef, useState, type ReactNode } from 'react';

export type Snap = 'peek' | 'half' | 'full';

const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

function snapPx(s: Snap) {
  const h = window.innerHeight;
  if (s === 'peek') return 148;
  if (s === 'half') return Math.round(h * 0.5);
  return h - 76;
}

/**
 * 모바일에서는 끌어올리는 하단 시트(peek / half / full 세 단계),
 * 데스크톱에서는 왼쪽에 떠 있는 패널로 동작합니다.
 */
export function Sheet({ snap, onSnap, header, children, scrollKey }: {
  snap: Snap;
  onSnap: (s: Snap) => void;
  header?: ReactNode;
  children: ReactNode;
  scrollKey: string;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ y: number; h: number; t: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const f = () => setMobile(isMobile());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [scrollKey]);

  function down(e: React.PointerEvent) {
    if (!mobile) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, h: snapPx(snap), t: Date.now() };
    setDrag(snapPx(snap));
  }
  function move(e: React.PointerEvent) {
    if (!start.current) return;
    const h = start.current.h + (start.current.y - e.clientY);
    setDrag(Math.max(110, Math.min(window.innerHeight - 60, h)));
  }
  function up(e: React.PointerEvent) {
    if (!start.current || drag === null) return;
    const dy = start.current.y - e.clientY;
    const v = dy / Math.max(1, Date.now() - start.current.t); // px/ms, 위로 +
    const order: Snap[] = ['peek', 'half', 'full'];
    let next: Snap;
    if (Math.abs(dy) < 6) {
      // 탭: 한 단계씩 순환
      next = snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'half';
    } else if (Math.abs(v) > 0.5) {
      const i = order.indexOf(snap) + (v > 0 ? 1 : -1);
      next = order[Math.max(0, Math.min(2, i))];
    } else {
      next = order.reduce((a, b) => (Math.abs(snapPx(b) - drag) < Math.abs(snapPx(a) - drag) ? b : a));
    }
    start.current = null;
    setDrag(null);
    onSnap(next);
  }

  const style = mobile ? { height: drag ?? snapPx(snap), transition: drag === null ? 'height .32s cubic-bezier(.2,.8,.2,1)' : 'none' } : undefined;

  return (
    <section className={`sheet snap-${snap}`} style={style} aria-label="panel">
      <div className="sheet-grip" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <span />
        {header}
      </div>
      <div className="sheet-body" ref={bodyRef}>{children}</div>
    </section>
  );
}
