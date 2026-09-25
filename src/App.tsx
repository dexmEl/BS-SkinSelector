import { useState, useRef, useCallback } from 'react';
import { CT_DATA, T_DATA, type Weapon, type KnifeType, type GlovesType, type Skin } from './data';
import imgCTKnifeStock from './imports/Stock-Images/CT Knife_Stock.png';
import imgTKnifeStock  from './imports/Stock-Images/T Knife_Stock.png';
import imgCTBackground from './imports/CT-Background.png';
import imgTBackground from './imports/T-Background.png';

type Side = 'ct' | 't';
type Selection = 'weapon' | 'knife' | 'gloves';

const VISIBLE = 8;

/* ─── Placeholder gun SVG ─────────────────────────────────── */
function GunSVG({ color = '#fff', size = 72 }: { color?: string; size?: number }) {
  /* fills width fully, aspect ~2.6:1 */
  return (
    <svg viewBox="0 0 130 50" width={size} height={size * 0.385} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* barrel */}
      <rect x="0" y="19" width="100" height="10" rx="3" fill={color} opacity=".55" />
      {/* upper receiver / slide */}
      <rect x="88" y="7" width="42" height="9" rx="2.5" fill={color} opacity=".55" />
      {/* muzzle brake */}
      <rect x="0" y="17" width="8" height="14" rx="2" fill={color} opacity=".45" />
      {/* grip */}
      <rect x="22" y="29" width="20" height="18" rx="3" fill={color} opacity=".5" />
      {/* trigger guard */}
      <path d="M22 29 Q18 36 22 43" stroke={color} strokeWidth="2.5" fill="none" opacity=".4" strokeLinecap="round" />
      {/* magazine */}
      <rect x="26" y="35" width="12" height="10" rx="2" fill={color} opacity=".4" />
      {/* scope / rail */}
      <rect x="70" y="12" width="22" height="5" rx="1.5" fill={color} opacity=".35" />
      {/* stock end */}
      <rect x="95" y="9" width="6" height="15" rx="2" fill={color} opacity=".35" />
    </svg>
  );
}

function KnifeSVG({ color = '#fff' }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 80" width="70" height="70" fill="none">
      <path d="M20 65 L55 20 C58 15 65 14 68 18 C71 22 70 29 65 32 L20 65 Z"
        fill={color} opacity=".35" />
      <path d="M20 65 L28 57 L32 61 Z" fill={color} opacity=".5" />
      <circle cx="66" cy="20" r="6" fill={color} opacity=".25" />
    </svg>
  );
}

function GlovesSVG({ color = '#fff' }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 80" width="70" height="70" fill="none">
      <rect x="20" y="30" width="40" height="35" rx="8" fill={color} opacity=".35" />
      <rect x="25" y="15" width="8" height="20" rx="4" fill={color} opacity=".3" />
      <rect x="36" y="12" width="8" height="22" rx="4" fill={color} opacity=".3" />
      <rect x="47" y="15" width="8" height="20" rx="4" fill={color} opacity=".3" />
      <rect x="15" y="32" width="8" height="18" rx="4" fill={color} opacity=".25" />
    </svg>
  );
}

/* ─── Theme tokens ────────────────────────────────────────── */
const themes = {
  ct: {
    accent: '#2196f3',
    accentBright: '#42a5f5',
    accentGlow: 'rgba(33,150,243,0.55)',
    accentGlowSoft: 'rgba(33,150,243,0.2)',
    panelBg: 'rgba(5,18,42,0.94)',
    panelBg2: 'rgba(8,26,60,0.97)',
    rowBg: 'rgba(7,22,52,0.95)',
    rowBgHover: 'rgba(10,30,70,0.98)',
    selRowBg: 'linear-gradient(90deg, rgba(21,73,158,0.9) 0%, rgba(10,36,90,0.7) 100%)',
    border: 'rgba(33,100,200,0.55)',
    borderBright: '#2196f3',
    heading: '#e8f4ff',
    text: '#7aafd4',
    textDim: '#3a6a9a',
    carouselBg: 'rgba(5,16,38,0.97)',
    bg: `url(${imgCTBackground})`,
    overlay: 'linear-gradient(180deg,rgba(2,10,26,0.72) 0%,rgba(4,16,38,0.60) 100%)',
    tileSelBg: 'linear-gradient(180deg,rgba(21,73,158,0.8) 0%,rgba(10,36,90,0.5) 100%)',
  },
  t: {
    accent: '#c9942a',
    accentBright: '#e8b84b',
    accentGlow: 'rgba(201,148,42,0.55)',
    accentGlowSoft: 'rgba(201,148,42,0.18)',
    panelBg: 'rgba(18,10,2,0.95)',
    panelBg2: 'rgba(24,14,2,0.97)',
    rowBg: 'rgba(20,12,2,0.95)',
    rowBgHover: 'rgba(30,18,4,0.98)',
    selRowBg: 'linear-gradient(90deg, rgba(100,65,8,0.85) 0%, rgba(50,30,4,0.6) 100%)',
    border: 'rgba(140,90,15,0.5)',
    borderBright: '#c9942a',
    heading: '#f5e8c0',
    text: '#b08540',
    textDim: '#6a4a15',
    carouselBg: 'rgba(14,8,0,0.97)',
    bg: `url(${imgTBackground})`,
    overlay: 'linear-gradient(180deg,rgba(20,10,0,0.75) 0%,rgba(25,14,0,0.62) 100%)',
    tileSelBg: 'linear-gradient(180deg,rgba(100,65,8,0.8) 0%,rgba(50,30,4,0.5) 100%)',
  },
};

export default function App() {
  const [side, setSide] = useState<Side>('ct');
  const [ctWeapon, setCtWeapon] = useState<Weapon>(CT_DATA.rifles.weapons[1]);
  const [tWeapon, setTWeapon] = useState<Weapon>(T_DATA.rifles.weapons[1]);
  const [ctSkin, setCtSkin] = useState(0);
  const [tSkin, setTSkin] = useState(0);
  // per-weapon skin selections (keyed by weapon name)
  const [ctWeaponSkins, setCtWeaponSkins] = useState<Record<string, number>>({});
  const [tWeaponSkins,  setTWeaponSkins]  = useState<Record<string, number>>({});
  const [ctKnifeSkin, setCtKnifeSkin] = useState(0);
  const [tKnifeSkin, setTKnifeSkin] = useState(0);
  const [ctGlovesSkin, setCtGlovesSkin] = useState(0);
  const [tGlovesSkin, setTGlovesSkin] = useState(0);
  const [carouselStart, setCarouselStart] = useState(0);
  const [sel, setSel] = useState<Selection>('weapon');
  const [ctKnifeView,    setCtKnifeView]    = useState<'types'|'skins'>('types');
  const [tKnifeView,     setTKnifeView]     = useState<'types'|'skins'>('types');
  const [ctGlovesView,   setCtGlovesView]   = useState<'types'|'skins'>('types');
  const [tGlovesView,    setTGlovesView]    = useState<'types'|'skins'>('types');
  const [ctKnifeType,    setCtKnifeType]    = useState(0);
  const [tKnifeType,     setTKnifeType]     = useState(0);
  const [ctGlovesType,   setCtGlovesType]   = useState(0);
  const [tGlovesType,    setTGlovesType]    = useState(0);
  const [ctKnifeEquipped,  setCtKnifeEquipped]  = useState(false);
  const [tKnifeEquipped,   setTKnifeEquipped]   = useState(false);
  const [ctGlovesEquipped, setCtGlovesEquipped] = useState(false);
  const [tGlovesEquipped,  setTGlovesEquipped]  = useState(false);
  // Variant selection for weapons like M4A1-S/M4A4 (0 = base weapon, 1+ = variants[i-1])
  const [ctVariantView, setCtVariantView] = useState<'types'|'skins'>('types');
  const [tVariantView,  setTVariantView]  = useState<'types'|'skins'>('types');
  const [ctVariantIdx,  setCtVariantIdx]  = useState<Record<string, number>>({});
  const [tVariantIdx,   setTVariantIdx]   = useState<Record<string, number>>({});

  const th = themes[side];
  const data = side === 'ct' ? CT_DATA : T_DATA;
  const weapon = side === 'ct' ? ctWeapon : tWeapon;

  // Returns skins with Stock prepended at index 0
  function effectiveSkins(w: Weapon): Skin[] {
    return [{ name: 'Stock', displayName: 'Stock', img: w.img ?? '' }, ...w.skins];
  }

  const knifeView      = side === 'ct' ? ctKnifeView      : tKnifeView;
  const glovesView     = side === 'ct' ? ctGlovesView     : tGlovesView;
  const setKnifeView  = side === 'ct' ? setCtKnifeView   : setTKnifeView;
  const setGlovesView = side === 'ct' ? setCtGlovesView  : setTGlovesView;
  const knifeTypeIdx   = side === 'ct' ? ctKnifeType      : tKnifeType;
  const glovesTypeIdx  = side === 'ct' ? ctGlovesType     : tGlovesType;
  const knifeSkinIdx   = side === 'ct' ? ctKnifeSkin      : tKnifeSkin;
  const glovesSkinIdx  = side === 'ct' ? ctGlovesSkin     : tGlovesSkin;
  const skinIdx        = side === 'ct' ? ctSkin            : tSkin;
  const knifeEquipped  = side === 'ct' ? ctKnifeEquipped  : tKnifeEquipped;
  const glovesEquipped = side === 'ct' ? ctGlovesEquipped : tGlovesEquipped;
  const knifeStockImg  = side === 'ct' ? imgCTKnifeStock  : imgTKnifeStock;
  const variantView    = side === 'ct' ? ctVariantView    : tVariantView;
  const variantIdxMap  = side === 'ct' ? ctVariantIdx     : tVariantIdx;

  function getActiveVariant(w: Weapon): Weapon {
    if (!w.variants) return w;
    const vi = variantIdxMap[w.name] ?? 0;
    return vi === 0 ? w : (w.variants[vi - 1] ?? w);
  }

  // Unified carousel items — either KnifeType/GlovesType (with img+name) or Skin (same shape)
  type CarouselItem = { name: string; displayName?: string; img: string };
  let carouselItems: CarouselItem[];
  let carouselSelected: number;
  if (sel === 'weapon') {
    if (weapon.variants && variantView === 'types') {
      carouselItems    = [weapon, ...weapon.variants] as CarouselItem[];
      carouselSelected = variantIdxMap[weapon.name] ?? 0;
    } else {
      const av = getActiveVariant(weapon);
      carouselItems    = effectiveSkins(av);
      carouselSelected = (side === 'ct' ? ctWeaponSkins : tWeaponSkins)[av.name] ?? 0;
    }
  } else if (sel === 'knife') {
    if (knifeView === 'types') {
      carouselItems    = [{ name: 'Stock', img: knifeStockImg }, ...data.knifeTypes] as CarouselItem[];
      carouselSelected = knifeTypeIdx;
    } else {
      carouselItems    = data.knifeTypes[knifeTypeIdx - 1].skins;
      carouselSelected = knifeSkinIdx;
    }
  } else {
    if (glovesView === 'types') {
      carouselItems    = data.glovesTypes as CarouselItem[];
      carouselSelected = glovesEquipped ? glovesTypeIdx : -1;
    } else {
      carouselItems    = data.glovesTypes[glovesTypeIdx].skins;
      carouselSelected = glovesSkinIdx;
    }
  }

  function pickWeapon(w: Weapon) {
    const alreadySelected = sel === 'weapon' && weapon.name === w.name;
    if (w.variants) {
      if (alreadySelected && variantView === 'skins') {
        // clicking slot again from skins view → go back to variant type selection
        if (side === 'ct') setCtVariantView('types'); else setTVariantView('types');
        setCarouselStart(0);
      } else if (!alreadySelected) {
        if (side === 'ct') { setCtWeapon(w); setCtVariantView('types'); }
        else { setTWeapon(w); setTVariantView('types'); }
        setSel('weapon');
        setCarouselStart(0);
      }
      return;
    }
    const savedIdx = (side === 'ct' ? ctWeaponSkins : tWeaponSkins)[w.name] ?? 0;
    if (side === 'ct') { setCtWeapon(w); setCtSkin(savedIdx); }
    else { setTWeapon(w); setTSkin(savedIdx); }
    setSel('weapon');
    setCarouselStart(0);
  }

  function pickCarouselItem(i: number) {
    if (sel === 'weapon') {
      if (weapon.variants && variantView === 'types') {
        // Picked a variant type → record selection and switch to skins view
        if (side === 'ct') { setCtVariantIdx(prev => ({ ...prev, [weapon.name]: i })); setCtVariantView('skins'); }
        else               { setTVariantIdx(prev => ({ ...prev, [weapon.name]: i }));  setTVariantView('skins'); }
        // Reset the skin selection for the newly chosen variant
        const av = i === 0 ? weapon : (weapon.variants[i - 1] ?? weapon);
        const savedIdx = (side === 'ct' ? ctWeaponSkins : tWeaponSkins)[av.name] ?? 0;
        if (side === 'ct') setCtSkin(savedIdx); else setTSkin(savedIdx);
        setCarouselStart(0);
      } else {
        const av = getActiveVariant(weapon);
        if (side === 'ct') {
          setCtSkin(i);
          setCtWeaponSkins(prev => ({ ...prev, [av.name]: i }));
        } else {
          setTSkin(i);
          setTWeaponSkins(prev => ({ ...prev, [av.name]: i }));
        }
      }
    } else if (sel === 'knife') {
      if (knifeView === 'types') {
        if (i === 0) {
          // Stock selected — reset to default, stay in types view
          if (side === 'ct') { setCtKnifeType(0); setCtKnifeEquipped(false); setCtKnifeSkin(0); }
          else               { setTKnifeType(0);  setTKnifeEquipped(false);  setTKnifeSkin(0); }
        } else {
          if (side === 'ct') setCtKnifeType(i); else setTKnifeType(i);
          setKnifeView('skins');
          if (side === 'ct') setCtKnifeSkin(0); else setTKnifeSkin(0);
          setCarouselStart(0);
        }
      } else {
        if (side === 'ct') { setCtKnifeSkin(i); setCtKnifeEquipped(true); }
        else               { setTKnifeSkin(i);  setTKnifeEquipped(true); }
      }
    } else {
      if (glovesView === 'types') {
        if (side === 'ct') setCtGlovesType(i); else setTGlovesType(i);
        setGlovesView('skins');
        if (side === 'ct') setCtGlovesSkin(0); else setTGlovesSkin(0);
        setCarouselStart(0);
      } else {
        if (side === 'ct') { setCtGlovesSkin(i); setCtGlovesEquipped(true); }
        else               { setTGlovesSkin(i);  setTGlovesEquipped(true); }
      }
    }
  }

  // Legacy alias kept for the preview panel
  const skins = carouselItems;
  const canPrev = carouselStart > 0;
  const canNext = carouselStart + VISIBLE < carouselItems.length;
  const wheelAccum = useRef(0);
  const onCarouselWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    wheelAccum.current += e.deltaY + e.deltaX;
    const threshold = 60;
    if (wheelAccum.current > threshold) {
      wheelAccum.current = 0;
      setCarouselStart(c => Math.min(Math.max(carouselItems.length - VISIBLE, 0), c + 1));
    } else if (wheelAccum.current < -threshold) {
      wheelAccum.current = 0;
      setCarouselStart(c => Math.max(0, c - 1));
    }
  }, [carouselItems.length]);

  /* ─── Column ───────────────────────────────────────────── */
  function Column({ cat }: { cat: typeof data.pistols }) {
    return (
      <div style={{
        flex: 1, minWidth: 0,
        border: `1px solid ${th.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: th.panelBg,
        boxShadow: `0 0 0 1px ${th.border}30`,
      }}>
        {/* column header */}
        <div style={{
          background: th.panelBg2,
          borderBottom: `1px solid ${th.border}`,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: th.accentBright,
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2.5,
        }}>
          {cat.label}
        </div>
        {/* rows */}
        <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {cat.weapons.map((w) => {
            const active = sel === 'weapon' && weapon.name === w.name;
            const weaponSkinMap = side === 'ct' ? ctWeaponSkins : tWeaponSkins;
            const av = getActiveVariant(w);
            const savedSkinIdx = weaponSkinMap[av.name] ?? 0;
            const eSkins = effectiveSkins(av);
            const savedSkin = eSkins[savedSkinIdx];
            const rowImg = savedSkin?.img || av.img;
            const skinLabel = savedSkinIdx > 0 && savedSkin ? (savedSkin.displayName ?? savedSkin.name) : null;
            const rowName = av.name;
            return (
              <button key={w.name} onClick={() => pickWeapon(w)} style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                flex: 1,
                border: `1px solid ${active ? th.accentBright : th.border}`,
                borderRadius: 5,
                background: active ? th.selRowBg : th.rowBg,
                boxShadow: active ? `0 0 10px ${th.accentGlow}, inset 0 0 6px ${th.accentGlowSoft}` : 'none',
                cursor: 'pointer',
                padding: 0,
                overflow: 'hidden',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = th.rowBgHover; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = th.rowBg; }}
              >
                {/* image cell */}
                <div style={{
                  width: 130,
                  alignSelf: 'stretch',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: `1px solid ${th.border}`,
                  background: th.panelBg2,
                  padding: '4px 6px',
                  overflow: 'hidden',
                }}>
                  {rowImg
                    ? <img src={rowImg} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <GunSVG color={th.heading} size={124} />}
                </div>
                {/* name + skin label */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 12, gap: 2 }}>
                  <span style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: active ? 700 : 600,
                    fontSize: 18,
                    color: active ? th.heading : th.text,
                    letterSpacing: 0.8,
                    lineHeight: 1,
                  }}>{rowName}</span>
                  {skinLabel && (
                    <span style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 500,
                      fontSize: 11,
                      color: th.accent,
                      letterSpacing: 1,
                      lineHeight: 1,
                    }}>{skinLabel}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Preview panel ────────────────────────────────────── */
  const previewName =
    sel === 'knife'
      ? (knifeEquipped && knifeTypeIdx > 0 ? data.knifeTypes[knifeTypeIdx - 1].name : 'KNIFE')
    : sel === 'gloves'
      ? (glovesEquipped ? data.glovesTypes[glovesTypeIdx].name : 'GLOVES')
    : getActiveVariant(weapon).name;
  const activeVariant = getActiveVariant(weapon);
  const activeSkinName =
    sel === 'knife' && knifeEquipped && knifeTypeIdx > 0
      ? (data.knifeTypes[knifeTypeIdx - 1].skins[knifeSkinIdx]?.displayName ?? data.knifeTypes[knifeTypeIdx - 1].skins[knifeSkinIdx]?.name ?? '')
    : sel === 'gloves' && glovesEquipped
      ? (data.glovesTypes[glovesTypeIdx].skins[glovesSkinIdx]?.displayName ?? data.glovesTypes[glovesTypeIdx].skins[glovesSkinIdx]?.name ?? '')
    : sel === 'weapon' && skinIdx > 0 && !(weapon.variants && variantView === 'types')
      ? (effectiveSkins(activeVariant)[skinIdx]?.displayName ?? effectiveSkins(activeVariant)[skinIdx]?.name ?? '')
    : '';

  function buildExportText() {
    const lines: string[] = [];
    const sides: Array<{ label: string; sideKey: Side }> = [
      { label: 'Counter-Terrorist', sideKey: 'ct' },
      { label: 'Terrorist', sideKey: 't' },
    ];
    for (const { label, sideKey } of sides) {
      const d = sideKey === 'ct' ? CT_DATA : T_DATA;
      const skinMap    = sideKey === 'ct' ? ctWeaponSkins   : tWeaponSkins;
      const varMap     = sideKey === 'ct' ? ctVariantIdx     : tVariantIdx;
      const knifeType  = sideKey === 'ct' ? ctKnifeType      : tKnifeType;
      const knifeSkin  = sideKey === 'ct' ? ctKnifeSkin      : tKnifeSkin;
      const knifeEq    = sideKey === 'ct' ? ctKnifeEquipped  : tKnifeEquipped;
      const glovesType = sideKey === 'ct' ? ctGlovesType     : tGlovesType;
      const glovesSkin = sideKey === 'ct' ? ctGlovesSkin     : tGlovesSkin;
      const glovesEq   = sideKey === 'ct' ? ctGlovesEquipped : tGlovesEquipped;
      const entries: string[] = [];
      const allWeapons = [...d.pistols.weapons, ...d.midTier.weapons, ...d.rifles.weapons];
      for (const w of allWeapons) {
        const vi = w.variants ? (varMap[w.name] ?? 0) : 0;
        const av = (w.variants && vi > 0) ? (w.variants[vi - 1] ?? w) : w;
        const idx = skinMap[av.name] ?? 0;
        if (idx > 0) {
          const skin = effectiveSkins(av)[idx];
          if (skin) entries.push(`${av.name}=${skin.name}`);
        }
      }
      if (knifeEq && knifeType > 0) {
        const kt = d.knifeTypes[knifeType - 1];
        const skin = kt.skins[knifeSkin];
        if (skin) entries.push(`${kt.name}=${skin.name}`);
      }
      if (glovesEq) {
        const gt = d.glovesTypes[glovesType];
        const skin = gt.skins[glovesSkin];
        if (skin) entries.push(`${gt.name}=${skin.name}`);
      }
      if (entries.length > 0) {
        lines.push(`${label}:`);
        lines.push(...entries);
      }
    }
    return lines.join('\n');
  }

  function handleExport() {
    const text = buildExportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BS-Config.lua';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundImage: th.bg,
      backgroundSize: 'cover', backgroundPosition: 'center',
      padding: '10px 14px',
      gap: 8,
      position: 'relative',
    }}>
      {/* overlay */}
      <div style={{ position: 'absolute', inset: 0, background: th.overlay, zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1440, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>

        {/* ── TABS ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <button onClick={handleExport} style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 11,
            letterSpacing: 2.5, color: th.accentBright,
            border: `1.5px solid ${th.border}`,
            borderRadius: 5,
            background: th.panelBg2,
            padding: '6px 18px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = th.accentBright; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 10px ${th.accentGlow}`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = th.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
          >EXPORT</button>
          {(['ct', 't'] as Side[]).map((s, i) => {
            const active = side === s;
            const t = themes[s];
            return (
              <button key={s} onClick={() => setSide(s)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 0',
                width: 260,
                justifyContent: 'center',
                border: `1.5px solid ${active ? t.accentBright : t.border}`,
                borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
                background: active
                  ? `linear-gradient(180deg, ${t.panelBg2} 0%, rgba(0,0,0,0.4) 100%)`
                  : 'rgba(0,0,0,0.55)',
                boxShadow: active ? `0 0 16px ${t.accentGlow}, inset 0 0 12px ${t.accentGlowSoft}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}>
                <span style={{
                  fontFamily: 'Orbitron, Rajdhani, sans-serif',
                  fontWeight: 700, fontSize: 12.5,
                  letterSpacing: 3,
                  color: active ? t.heading : t.border,
                }}>
                  {s === 'ct' ? 'COUNTER-TERRORIST' : 'TERRORIST'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── MAIN GRID ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>

          <Column cat={data.pistols} />
          <Column cat={data.midTier} />
          <Column cat={data.rifles} />

          {/* PREVIEW + KNIFE/GLOVES */}
          <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* preview panel */}
            <div style={{
              flex: 1, minHeight: 0,
              border: `1.5px solid ${th.borderBright}`,
              borderRadius: 8,
              background: th.panelBg,
              boxShadow: `0 0 20px ${th.accentGlow}`,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* header */}
              <div style={{
                background: th.panelBg2,
                borderBottom: `1px solid ${th.border}`,
                padding: '10px 16px',
                display: 'flex', alignItems: 'baseline', gap: 10,
              }}>
                <span style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 700, fontSize: 18,
                  color: th.heading, letterSpacing: 1.5,
                }}>{previewName}</span>
                {activeSkinName && (
                  <span style={{
                    fontFamily: 'Rajdhani', fontWeight: 500, fontSize: 11,
                    color: th.accent, letterSpacing: 1, marginLeft: 'auto',
                  }}>{activeSkinName}</span>
                )}
              </div>
              {/* image */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
                background: `radial-gradient(ellipse at center, ${th.accentGlowSoft} 0%, transparent 65%)`,
                position: 'relative',
              }}>
                {/* faction watermark */}
                <div style={{
                  position: 'absolute', right: 20, bottom: 20,
                  opacity: 0.07,
                  color: th.accentBright,
                }}>
                  <svg viewBox="0 0 80 80" width="80" height="80" fill="currentColor">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4"/>
                    <path d="M40 8 L48 30 L72 30 L54 46 L60 68 L40 55 L20 68 L26 46 L8 30 L32 30 Z"/>
                  </svg>
                </div>
                {sel === 'weapon' ? (
                  (() => {
                    const allSkins = (weapon.variants && variantView === 'types')
                      ? [{ name: activeVariant.name, img: activeVariant.img ?? '' }]
                      : effectiveSkins(activeVariant);
                    const previewImg = allSkins[skinIdx]?.img || activeVariant.img;
                    const previewAlt = allSkins[skinIdx]?.displayName ?? allSkins[skinIdx]?.name ?? activeVariant.name;
                    return previewImg
                      ? <img src={previewImg} alt={previewAlt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      : <GunSVG color={th.heading} size={340} />;
                  })()
                ) : sel === 'knife' ? (
                  (() => {
                    let previewImg: string;
                    let previewAlt: string;
                    if (knifeEquipped && knifeTypeIdx > 0) {
                      const kt = data.knifeTypes[knifeTypeIdx - 1];
                      previewImg = kt.skins[knifeSkinIdx]?.img ?? kt.img;
                      previewAlt = kt.skins[knifeSkinIdx]?.displayName ?? kt.skins[knifeSkinIdx]?.name ?? kt.name;
                    } else {
                      previewImg = knifeStockImg;
                      previewAlt = 'Knife';
                    }
                    return <img src={previewImg} alt={previewAlt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
                  })()
                ) : (
                  (() => {
                    if (!glovesEquipped) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 0.35 }}>
                          <GlovesSVG color={th.heading} />
                          <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 12, color: th.text, letterSpacing: 2 }}>NONE EQUIPPED</span>
                        </div>
                      );
                    }
                    const gt = data.glovesTypes[glovesTypeIdx];
                    const previewImg = gt.skins[glovesSkinIdx]?.img ?? gt.img;
                    const previewAlt = gt.skins[glovesSkinIdx]?.displayName ?? gt.skins[glovesSkinIdx]?.name ?? gt.name;
                    return <img src={previewImg} alt={previewAlt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
                  })()
                )}
              </div>
            </div>

            {/* knife + gloves */}
            <div style={{ display: 'flex', gap: 8, height: 160 }}>
              {([
                { key: 'knife' as const, label: 'KNIFE',
                  getItem: (): KnifeType => data.knifeTypes[knifeTypeIdx > 0 ? knifeTypeIdx - 1 : 0],
                  Placeholder: () => <KnifeSVG color={th.heading} />,
                },
                { key: 'gloves' as const, label: 'GLOVES',
                  getItem: (): GlovesType => data.glovesTypes[glovesTypeIdx],
                  Placeholder: () => <GlovesSVG color={th.heading} />,
                },
              ]).map(({ key, label, getItem, Placeholder }) => {
                const active = sel === key;
                const item = getItem();
                const handleClick = () => {
                  if (key === 'knife') {
                    if (sel === 'knife' && knifeView === 'skins') {
                      setKnifeView('types');
                      setCarouselStart(0);
                    } else if (sel !== 'knife') {
                      setSel('knife');
                      setKnifeView('types');
                      setCarouselStart(0);
                    }
                  } else {
                    if (sel === 'gloves' && glovesView === 'skins') {
                      setGlovesView('types');
                      setCarouselStart(0);
                    } else if (sel !== 'gloves') {
                      setSel('gloves');
                      setGlovesView('types');
                      setCarouselStart(0);
                    }
                  }
                };
                return (
                  <button key={key} onClick={handleClick} style={{
                    flex: 1,
                    border: `1.5px solid ${active ? th.accentBright : th.border}`,
                    borderRadius: 8,
                    background: active
                      ? `linear-gradient(180deg, ${th.panelBg2} 0%, ${th.tileSelBg.replace('linear-gradient(180deg,','').replace(/ 100%\)$/,'')} 100%)`
                      : th.panelBg,
                    boxShadow: active ? `0 0 12px ${th.accentGlow}` : 'none',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', padding: 0,
                    transition: 'all 0.14s',
                  }}>
                    <div style={{
                      background: th.panelBg2,
                      borderBottom: `1px solid ${th.border}`,
                      padding: '6px 10px',
                      display: 'flex', alignItems: 'center', gap: 6,
                      color: th.accentBright,
                      fontFamily: 'Rajdhani', fontWeight: 700,
                      fontSize: 12, letterSpacing: 2,
                    }}>
                      {label}
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {key === 'knife' ? (
                        knifeEquipped
                          ? <img src={data.knifeTypes[knifeTypeIdx - 1].skins[knifeSkinIdx]?.img ?? data.knifeTypes[knifeTypeIdx - 1].img} alt={item.name} style={{ maxWidth: '90%', maxHeight: 75, objectFit: 'contain' }} />
                          : <img src={knifeStockImg} alt="Knife" style={{ maxWidth: '90%', maxHeight: 75, objectFit: 'contain' }} />
                      ) : (
                        glovesEquipped
                          ? <img src={data.glovesTypes[glovesTypeIdx].skins[glovesSkinIdx]?.img ?? data.glovesTypes[glovesTypeIdx].img} alt={item.name} style={{ maxWidth: '90%', maxHeight: 75, objectFit: 'contain' }} />
                          : null
                      )}
                    </div>
                    <div style={{
                      padding: '4px 6px 7px',
                      textAlign: 'center',
                      fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 11,
                      color: th.text, letterSpacing: 0.5,
                    }}>
                      {key === 'knife'
                        ? (knifeEquipped && knifeTypeIdx > 0 ? data.knifeTypes[knifeTypeIdx - 1].name : 'Default')
                        : (glovesEquipped ? data.glovesTypes[glovesTypeIdx].name : 'None Equipped')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CAROUSEL ─────────────────────────────────────── */}
        <div style={{
          border: `1px solid ${th.border}`,
          borderRadius: 8,
          background: th.carouselBg,
          padding: '8px 12px 10px',
        }}>
          {/* header row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 8,
          }}>
            <span style={{
              fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
              fontSize: 12, letterSpacing: 2.5, color: th.heading,
            }}>
              {sel === 'weapon'
              ? (weapon.variants && variantView === 'types')
                ? `SELECT ${weapon.name} / ${weapon.variants.map(v => v.name).join(' / ')}`
                : `${activeVariant.name} SKINS`
              : sel === 'knife'
                ? knifeView === 'types'
                  ? 'SELECT KNIFE TYPE'
                  : `${knifeTypeIdx > 0 ? data.knifeTypes[knifeTypeIdx - 1].name : 'KNIFE'} SKINS`
                : glovesView === 'types'
                  ? 'SELECT GLOVES TYPE'
                  : `${data.glovesTypes[glovesTypeIdx].name} SKINS`
            }
            </span>

            <span style={{ marginLeft: 'auto', fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 11, color: th.text, letterSpacing: 1 }}>
              {(sel === 'knife' && knifeView === 'types')
                ? `${data.knifeTypes.length + 1} TYPES`
                : (sel === 'gloves' && glovesView === 'types')
                  ? `${data.glovesTypes.length} TYPES`
                  : (sel === 'weapon' && weapon.variants && variantView === 'types')
                    ? `${(weapon.variants?.length ?? 0) + 1} TYPES`
                    : carouselItems.length > 0 ? `${carouselItems.length} SKINS` : ''}
            </span>
          </div>

          {/* tiles */}
          <div
            onWheel={onCarouselWheel}
            style={{ overflow: 'hidden', position: 'relative' }}
          >
            {(() => {
              const gap = 7;
              const tileW = `calc((100% - ${(VISIBLE - 1) * gap}px) / ${VISIBLE})`;
              return (
                <div style={{
                  display: 'flex',
                  gap,
                  transform: `translateX(calc(-${carouselStart * 100 / VISIBLE}% - ${carouselStart * gap / VISIBLE}px))`,
                  transition: 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'transform',
                  width: '100%',
                }}>
                  {carouselItems.map((skin, gi) => {
                    if (!skin) return null;
                    const active = gi === carouselSelected;
                    const fallbackImg = sel === 'weapon' ? weapon.img : undefined;
                    const imgSrc = skin.img || fallbackImg;
                    return (
                      <button key={`${skin.name}-${gi}`} onClick={() => pickCarouselItem(gi)} style={{
                        width: tileW, flexShrink: 0,
                        border: `1.5px solid ${active ? th.accentBright : th.border}`,
                        borderRadius: 6,
                        background: active ? th.tileSelBg : th.panelBg2,
                        boxShadow: active ? `0 0 10px ${th.accentGlow}, inset 0 0 5px ${th.accentGlowSoft}` : 'none',
                        cursor: 'pointer',
                        padding: '7px 5px 5px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        position: 'relative',
                        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
                      }}>
                        {active && (
                          <div style={{
                            position: 'absolute', top: 5, right: 5,
                            width: 16, height: 16, borderRadius: '50%',
                            background: th.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg viewBox="0 0 10 8" width="9" height="7" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                        <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {imgSrc
                            ? <img src={imgSrc} alt={skin.displayName ?? skin.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <GunSVG color={th.heading} size={80} />}
                        </div>
                        <span style={{
                          fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 10.5,
                          color: active ? th.heading : th.text,
                          letterSpacing: 0.3, textAlign: 'center',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', maxWidth: '100%',
                        }}>{skin.displayName ?? skin.name}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}
