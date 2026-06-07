import { useState, useEffect } from 'react'
import styled from 'styled-components'
import './App.css'

const DENSITY = {
  compact: {
    rowPadding: '4px 8px',
    fontSize: '0.75rem',
    inputPadding: '0.3rem 0.6rem',
    inputFontSize: '0.75rem',
    cardHeaderFontSize: '14px',
    cardPadding: '0px',
    cardWidth: '280px',
    cardFontSize: '1rem',
    kpiFontSize: '0.65rem',
    improvementSelectPadding: '0.25rem 0.25rem',
  },
  default: {
    rowPadding: '8px 12px',
    fontSize: '0.85rem',
    inputPadding: '0.45rem 0.8rem',
    inputFontSize: '0.82rem',
    cardHeaderFontSize: '16px',
    cardPadding: '2px',
    cardWidth: '300px',
    cardFontSize: '1.25rem',
    kpiFontSize: '0.75rem',
    improvementSelectPadding: '0.5rem 0.5rem',
  },
  comfortable: {
    rowPadding: '14px 16px',
    fontSize: '0.95rem',
    inputPadding: '0.65rem 1rem',
    inputFontSize: '0.9rem',
    cardHeaderFontSize: '20px',
    cardPadding: '10px',
    cardWidth: '340px',
    cardFontSize: '1.5rem',
    kpiFontSize: '1rem',
    improvementSelectPadding: '0.75rem 0.75rem',
  },
}

/* ─── Layout constants ───────────────────────────────────────────────────────
   HEADER_H  : height of the sticky header bar
   TABBAR_H  : height of the tab bar below it
   SECTION_TOP: where all tab sections start (header + tabbar + small gap)
   TABLE_BODY_MAX: how tall the scrollable tbody can be before it scrolls
   These are CSS custom properties so every styled-component can reference
   them from a single source of truth.
──────────────────────────────────────────────────────────────────────────── */
const GlobalLayout = styled.div`
  --header-h: 56px;
  --tabbar-h: 48px;
  --section-top: calc(var(--header-h) + var(--tabbar-h) + 8px);
  --table-body-max: calc(100vh - var(--section-top) - 6rem);
`

const Container = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  margin: 0;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding: 1.5rem 1rem;
  overflow: hidden;
  background:
    radial-gradient(ellipse 60% 40% at 50% 30%, rgba(242, 201, 107, 0.07) 0%, transparent 70%),
    radial-gradient(circle at top, rgba(255, 70, 70, 0.14), transparent 38%),
    linear-gradient(180deg, #1b0f0e 0%, #221312 45%, #181818 100%);
  color: #f8fafc;
`

/* ─── HEADER ─────────────────────────────────────────────────────────────── */
const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  background: rgba(28, 11, 10, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px);
  box-sizing: border-box;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease;
  z-index: 20;
  overflow: hidden;               /* never let it grow taller */

  ${(p) => p.searched && `
    opacity: 1;
    pointer-events: auto;
  `}
`

const HeaderBrand = styled.div`
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #f2c96b 0%, #f07a5b 45%, #9fc7c7 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShimmer 8s ease-in-out infinite;
  flex-shrink: 0;
  white-space: nowrap;
`

const HeaderDivider = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`

const HeaderStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
`

const HeaderStatVal = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: #f2c96b;
  white-space: nowrap;
`

const HeaderStatLbl = styled.span`
  font-size: 0.6rem;
  color: rgba(248, 250, 252, 0.32);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
`

/* Center group: scrolls horizontally on very small screens, but hides
   overflow on the header so it stays a single line */
const HeaderCenter = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;

  /* below 900 px hide everything except the summoner + region stats */
  @media (max-width: 900px) {
    .hide-narrow { display: none; }
  }
`

const ImprovementFocusCD = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(242,201,107,0.07);
  border: 1px solid rgba(242,201,107,0.18);
  border-radius: 999px;
  padding: 3px 10px 3px 8px;
  flex-shrink: 0;
  white-space: nowrap;
`

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 1200px) { display: none; }
`

/* ─── TAB BAR ────────────────────────────────────────────────────────────── */
const TabBar = styled.nav`
  position: fixed;
  top: var(--header-h);
  left: 0;
  width: 100%;
  height: var(--tabbar-h);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
  background: rgba(28, 11, 10, 0.88);
  border-bottom: 1px solid rgba(248, 149, 56, 0.18);
  box-shadow: 0 4px 24px rgba(248, 100, 0, 0.10);
  backdrop-filter: blur(18px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.55s ease 0.1s;
  z-index: 19;

  ${(p) => p.searched && `
    opacity: 1;
    pointer-events: auto;
  `}
`

const TabLinks = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 1.4vw, 1.6rem);
  white-space: nowrap;

  a {
    color: rgba(248, 250, 252, 0.6);
    font-size: clamp(0.72rem, 1vw, 0.95rem);
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.25s ease, transform 180ms ease, padding 180ms ease;
  }

  a:hover { color: #ffffff; }

  a[data-active="true"] {
    position: relative;
    background: linear-gradient(135deg, #f2c96b 0%, #f07a5b 45%, #9fc7c7 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    animation: gradientMove 5s ease-in-out infinite;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-weight: 700;
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 0 0 1.5px rgba(248, 149, 56, 0.45),
      0 0 8px rgba(248, 100, 0, 0.18);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: rgba(248, 149, 56, 0.10);
      pointer-events: none;
    }
  }

  @keyframes gradientMove {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`

const DensityToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 3px;
  flex-shrink: 0;
  margin-left: auto;
`

const DensityBtn = styled.button`
  border: none;
  border-radius: 999px;
  cursor: pointer;
  padding: 3px 8px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: background 0.2s ease, color 0.2s ease;
  background: ${(p) => p.active ? 'rgba(248, 149, 56, 0.22)' : 'transparent'};
  color: ${(p) => p.active ? '#f2c96b' : 'rgba(248, 250, 252, 0.45)'};
  border: 1px solid ${(p) => p.active ? 'rgba(248, 149, 56, 0.35)' : 'transparent'};
  white-space: nowrap;

  &:hover { color: rgba(248, 250, 252, 0.8); }
`

/* ─── BANNER (landing) ────────────────────────────────────────────────────── */
const Banner = styled.section`
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(980px, calc(100% - 2rem));
  padding: clamp(2rem, 3vw, 4rem) clamp(1.25rem, 4vw, 2rem);
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transform: translate(-50%, -50%);
  transition: transform 0.85s ease, opacity 0.45s ease;

  ${(p) => p.searched && `
    transform: translate(-50%, -120vh);
    opacity: 0;
    pointer-events: none;
  `}
`

const BannerEyebrow = styled.p`
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 149, 56, 0.75);
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &::before, &::after {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: rgba(248, 149, 56, 0.4);
  }
`

const BannerTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.8rem, 5vw, 5.2rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
  max-width: 900px;
  font-family: 'Josefin Sans', sans-serif;
  background: linear-gradient(135deg, #f2c96b 0%, #f07a5b 45%, #9fc7c7 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShimmer 8s ease-in-out infinite;

  @keyframes titleShimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  span { display: block; }

  @media (max-width: 640px) {
    font-size: clamp(2.2rem, 9vw, 3.2rem);
    letter-spacing: -0.03em;
  }
`

const BannerTagline = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  color: rgba(248, 250, 252, 0.5);
  max-width: 440px;
  line-height: 1.6;
  letter-spacing: 0.01em;
`

const BannerDivider = styled.div`
  width: 48px;
  height: 2px;
  border-radius: 99px;
  background: linear-gradient(90deg, #f2c96b, #f07a5b);
  opacity: 0.6;
`

const ActionButton = styled.button`
  border: 1px solid rgba(248, 149, 56, 0.35);
  cursor: pointer;
  outline: none;
  padding: 0.9rem 2.4rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #fef3e2;
  background: rgba(248, 149, 56, 0.12);
  backdrop-filter: blur(10px);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(242,201,107,0.18), rgba(240,122,91,0.18));
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(248, 149, 56, 0.65);
    box-shadow: 0 0 28px rgba(248, 149, 56, 0.28), 0 8px 32px rgba(0,0,0,0.3);
    background: rgba(248, 149, 56, 0.18);
  }

  &:hover::after { opacity: 1; }
  &:active { transform: translateY(0); }
`

const FormPanel = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: flex-start;
  margin-top: 0.5rem;
  opacity: ${(p) => (p.visible ? 1 : 0)};
  transform: translateY(${(p) => (p.visible ? '0' : '20px')});
  pointer-events: ${(p) => (p.visible ? 'auto' : 'none')};
  transition: opacity 0.35s ease, transform 0.35s ease;
`

const CombinedForm = styled.div`
  display: flex;
  width: 100%;
  max-width: 920px;
  background: rgba(6, 8, 14, 0.7);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 0.5rem;
  gap: 0.5rem;
  align-items: stretch;
  box-shadow: 0 6px 30px rgba(2,6,23,0.45);
  transition: opacity 0.18s ease, transform 0.18s ease;
  opacity: ${(p) => (p.visible ? 1 : 0)};
  transform: translateY(${(p) => (p.visible ? '0' : '12px')});

  @media (max-width: 700px) { flex-direction: column; }
`

const Unit = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  padding: 0.5rem;
`
const RegionUnit = styled(Unit)` flex: 0.6; `
const SearchUnit = styled(Unit)` flex: 1.4; `
const SearchButtonUnit = styled(Unit)` flex: 0.3; `

const Divider = styled.div`
  width: 1px;
  background: rgba(255,255,255,0.06);
  margin: 6px 0;
  border-radius: 1px;
  align-self: stretch;
  @media (max-width: 700px) { display: none; }
`

const StyledSelect = styled.select`
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background: rgba(20, 26, 48, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(255,255,255,0.04);
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover { background: rgba(25, 32, 56, 0.9); cursor: pointer; }
  &:focus {
    outline: none;
    border-color: #f85538;
    box-shadow: 0 6px 18px rgba(56,189,248,0.08);
    transform: translateY(-1px);
    background: rgba(25, 32, 56, 0.95);
  }
`

const ReviewSelect = styled.select`
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  background: ${(p) => {
    if (p.value === 'Good' || p.value === 'Calm') return 'rgba(34, 197, 94, 0.8)'
    if (p.value === 'Okay' || p.value === 'Frustrated') return 'rgba(234, 179, 8, 0.8)'
    if (p.value === 'Bad' || p.value === 'Tilted') return 'rgba(239, 68, 68, 0.8)'
    return 'rgba(20, 26, 48, 0.8)'
  }};
  color: #f8fafc;
  border: 1px solid rgba(255,255,255,0.08);
  padding: ${(p) => p.$d?.inputPadding || '0.45rem 0.8rem'};
  font-size: ${(p) => p.$d?.inputFontSize || '0.82rem'};
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover { filter: brightness(0.82); border-color: rgba(255,255,255,0.18); }
  &:focus {
    outline: none;
    filter: brightness(0.82);
    box-shadow: 0 0 0 3px ${(p) => {
      if (p.value === 'Good' || p.value === 'Calm') return 'rgba(34, 197, 94, 0.35)'
      if (p.value === 'Okay' || p.value === 'Frustrated') return 'rgba(234, 179, 8, 0.35)'
      if (p.value === 'Bad' || p.value === 'Tilted') return 'rgba(239, 68, 68, 0.35)'
      return 'rgba(248, 85, 56, 0.35)'
    }};
  }

  option[value="Good"]        { background-color: #15803d; color: #f0fdf4; }
  option[value="Okay"]        { background-color: #a16207; color: #fefce8; }
  option[value="Bad"]         { background-color: #b91c1c; color: #fef2f2; }
  option[value="Calm"]        { background-color: #15803d; color: #f0fdf4; }
  option[value="Frustrated"]  { background-color: #a16207; color: #fefce8; }
  option[value="Tilted"]      { background-color: #b91c1c; color: #fef2f2; }
`

const ReviewNotes = styled.div`
  width: 100%;
  .form-control {
    background: rgba(20, 26, 48, 0.8) !important;
    color: #f8fafc !important;
    border: 1px solid rgba(255,255,255,0.04) !important;
    padding: ${(p) => p.$d?.inputPadding || '0.45rem 0.8rem'} !important;
    font-size: ${(p) => p.$d?.inputFontSize || '0.82rem'} !important;
    height: auto !important;
    border-radius: 10px !important;
    transition: border-color 0.22s ease, box-shadow 0.22s ease !important;
  }
  .form-control::placeholder { color: transparent !important; }
  .form-control:focus {
    border-color: #f85538 !important;
    box-shadow: 0 6px 18px rgba(56,189,248,0.08) !important;
  }
`

const FloatingWrapper = styled.div`
  width: 100%;
  .form-control {
    background: rgba(20, 26, 48, 0.8) !important;
    color: #f8fafc !important;
    border: 1px solid rgba(255,255,255,0.04) !important;
    padding: 1rem 1rem 0.5rem !important;
    height: auto !important;
    border-radius: 10px !important;
    transition: border-color 0.22s ease, box-shadow 0.22s ease !important;
  }
  .form-control::placeholder { color: transparent !important; }
  label {
    color: rgba(248, 250, 252, 0.6) !important;
    padding: 1rem 1rem !important;
    transform-origin: left top !important;
  }
  .form-control:focus {
    border-color: #f85538 !important;
    box-shadow: 0 6px 18px rgba(56,189,248,0.08) !important;
  }
  .form-control:focus ~ label,
  .form-control:not(:placeholder-shown) ~ label {
    color: rgba(248, 250, 252, 0.9) !important;
    padding: 0.5rem 1rem !important;
  }
`

const SearchButton = styled.button`
  width: 100%;
  height: 100%;
  min-height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #eda53a, #f83852);
  color: #2a0f0f;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 50px rgba(248, 149, 56, 0.32);
    background: linear-gradient(135deg, #a87221, #e90e50);
  }
  &:active {
    transform: translateY(0);
    background: linear-gradient(135deg, #a87221, #e90e50);
  }
`

/* ─── SHARED TABLE PRIMITIVES ────────────────────────────────────────────── */
const Table = styled.div`
  width: 100%;
  background: rgba(6, 8, 14, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 0.5rem;
  box-shadow: rgba(2, 6, 23, 0.45) 0px 6px 30px;
`

/* Scrollable tbody container.
   max-height is relative to viewport minus the fixed chrome above. */
const TableBodyWrapper = styled.div`
  max-height: var(--table-body-max, calc(100vh - 260px));
  overflow-y: auto;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

/* Shared sticky header table */
const sharedHeaderTh = `
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 700;
  color: #9fc7c7;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 0.72rem;
  background: #210e0b;
  border-bottom: 2px solid rgba(255,255,255,0.12);
  border-right: none;
  border-left: none;
  background-clip: padding-box;
  white-space: nowrap;          /* never wrap header text */
  overflow: hidden;
  text-overflow: ellipsis;
`

const sharedBodyTd = (d) => `
  padding: ${d?.rowPadding || '8px 12px'};
  font-size: ${d?.fontSize || '0.85rem'};
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-right: none;
  border-left: none;
  word-break: break-word;
  white-space: normal;
  transition: padding 0.25s ease, font-size 0.25s ease;
`

/* ─── TAB SECTION BASE ────────────────────────────────────────────────────
   All sections share the same base positioning.
   top is driven by --section-top so it adapts if the chrome heights change.
──────────────────────────────────────────────────────────────────────────── */
const sectionBase = `
  position: absolute;
  top: var(--section-top, 112px);
  left: 50%;
  bottom: 1rem;
  width: calc(100vw - 2rem);
  max-width: calc(100vw - 2rem);
  padding: 1.5rem clamp(0.75rem, 2vw, 2rem);
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  overflow: visible;
  opacity: 0;
  pointer-events: none;
`

/* Tab order for slide transitions:
   Banner (off-screen-up when searched)
   Overview  (index 0) – leftmost
   Details   (index 1)
   Metrics   (index 2)
   Tempo     (index 3)
   Review    (index 4)
   Weekly Summary (index 5)
   Focus Cycles   (index 6) – rightmost

   Active tab  → translate(-50%, 0)
   Tab to left → translate(calc(-50% - 100vw), 0)   (slides left, off screen)
   Tab to right→ translate(calc(-50% + 100vw), 0)   (slides right, off screen)
*/
const TAB_ORDER = ['Overview','Details','Metrics','Tempo','Review','Weekly Summary','Focus Cycles']

function slideCSS(myName, active, searched) {
  if (!searched) return 'transform: translate(-50%, 100vh);'
  if (myName === active) return 'transform: translate(-50%, 0); opacity: 1; pointer-events: auto;'
  const myIdx = TAB_ORDER.indexOf(myName)
  const activeIdx = TAB_ORDER.indexOf(active)
  if (myIdx < activeIdx) return 'transform: translate(calc(-50% - 100vw), 0);'
  return 'transform: translate(calc(-50% + 100vw), 0);'
}

/* ─── OVERVIEW ───────────────────────────────────────────────────────────── */
const overviewCols = [
  { w: '8%' }, { w: '14%' }, { w: '10%' }, { w: '16%' },
  { w: '8%' }, { w: '14%' }, { w: '10%' }, { w: '10%' },
]

const Overview = styled.section`
  ${sectionBase}
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Overview', p.active, p.searched)}
`

const OverviewTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${overviewCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 60px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const OverviewBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${overviewCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 60px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

/* ─── DETAILS ────────────────────────────────────────────────────────────── */
const detailsCols = [
  { w: '5%' }, { w: '9%' }, { w: '9%' }, { w: '5%' }, { w: '6%' },
  { w: '6%' }, { w: '5%' }, { w: '8%' }, { w: '7%' }, { w: '9%' },
  { w: '9%' }, { w: '9%' }, { w: '8%' },
]

const Details = styled.section`
  ${sectionBase}
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Details', p.active, p.searched)}
`

const DetailsTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${detailsCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 48px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const DetailsBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${detailsCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 48px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

/* ─── METRICS ────────────────────────────────────────────────────────────── */
const metricsCols = [
  { w: '10%' }, { w: '12%' }, { w: '10%' }, { w: '11%' }, { w: '11%' },
  { w: '11%' }, { w: '11%' }, { w: '11%' }, { w: '13%' },
]

const Metrics = styled.section`
  ${sectionBase}
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Metrics', p.active, p.searched)}
`

const MetricsTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${metricsCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 60px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const MetricsBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${metricsCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 60px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

/* ─── TEMPO ──────────────────────────────────────────────────────────────── */
const tempoCols = [
  { w: '6%' }, { w: '9%' }, { w: '9%' }, { w: '11%' }, { w: '9%' },
  { w: '10%' }, { w: '9%' }, { w: '10%' }, { w: '10%' }, { w: '12%' },  // adjusted - removed extra column (was 11 cols)
]

const Tempo = styled.section`
  ${sectionBase}
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Tempo', p.active, p.searched)}
`

const TempoTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${tempoCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 60px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const TempoBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${tempoCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 60px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

/* ─── REVIEW ─────────────────────────────────────────────────────────────── */
const reviewCols = [
  { w: '5%' }, { w: '10%' }, { w: '12%' }, { w: '12%' },
  { w: '10%' }, { w: '14%' }, { w: '37%' },
]

const Review = styled.section`
  ${sectionBase}
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Review', p.active, p.searched)}
`

const ReviewTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${reviewCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 48px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const ReviewBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${reviewCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 48px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

/* ─── WEEKLY SUMMARY ─────────────────────────────────────────────────────── */
const weeklyCols = Array(13).fill({ w: '7.69%' })

const WeeklySummary = styled.section`
  ${sectionBase}
  justify-content: flex-start;
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Weekly Summary', p.active, p.searched)}
`

const WeeklySummaryTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} font-size: 0.62rem; }
  ${weeklyCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 52px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const WeeklySummaryBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${weeklyCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 52px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

/* KPI card row */
const KpiRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;          /* wrap onto a second row if viewport is narrow */
  gap: 0.75rem;
  justify-content: center;
`

const CardHeader = styled.div`
  font-size: ${(p) => p.$d?.cardHeaderFontSize || '16px'};
  font-weight: 700;
  transition: font-size 0.25s ease;
`

/* Generic KPI card factory to remove the massive duplication */
function makeKpiCard(getBg, getShadow, getBorder) {
  const Outer = styled.div`
    flex: 1 1 130px;
    max-width: ${(p) => p.$d?.cardWidth || '300px'};
    background: ${(p) => getBg(p.value)};
    border: 1px solid rgba(255, 102, 0, 0);
    border-radius: 999px;
    padding: clamp(0.25rem, 0.15vw, 0.375rem);
    box-shadow: ${(p) => getShadow(p.value)};
    transition: padding 0.25s ease, font-size 0.25s ease, max-width 0.25s ease;
  `
  const Inner = styled.div`
    width: 100%;
    background: ${(p) => getBg(p.value)};
    border: ${(p) => getBorder(p.value)};
    border-radius: 999px;
    padding: ${(p) => p.$d?.cardPadding || '16px'} !important;
    box-shadow: inset rgba(0, 0, 0, 0.27) 0px 6px 30px;
    transition: padding 0.25s ease, font-size 0.25s ease;
  `
  const Kpi = styled.div`
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.7);
    padding: 0;
    font-size: ${(p) => p.$d?.kpiFontSize || '0.75rem'};
    font-weight: 600;
    white-space: nowrap;
    transition: font-size 0.25s ease;
  `
  return { Outer, Inner, Kpi }
}

const colorRed   = 'rgba(255, 0, 0, 0.22)'
const colorYellow= 'rgba(255, 217, 0, 0.22)'
const colorGreen = 'rgba(0, 255, 0, 0.22)'
const colorCyan  = 'rgba(0, 255, 255, 0.22)'
const shadowRed   = 'rgba(97, 1, 1, 0.45) 0px 6px 30px'
const shadowYellow= 'rgba(161, 98, 7, 0.45) 0px 6px 30px'
const shadowGreen = 'rgba(0, 97, 0, 0.45) 0px 6px 30px'
const shadowCyan  = 'rgba(0, 97, 97, 0.45) 0px 6px 30px'
const borderFor = (color) => `3px solid ${color}`

const GamesPlayed = makeKpiCard(
  v => v < 10 ? colorRed : v <= 15 ? colorYellow : v < 25 ? colorGreen : colorCyan,
  v => v < 10 ? shadowRed : v <= 15 ? shadowYellow : v < 25 ? shadowGreen : shadowCyan,
  v => borderFor(v < 10 ? colorRed : v <= 15 ? colorYellow : v < 25 ? colorGreen : colorCyan)
)
const WinRate = makeKpiCard(
  v => v < 0.5 ? colorRed : v <= 0.529 ? colorYellow : v < 0.6 ? colorGreen : colorCyan,
  v => v < 0.5 ? shadowRed : v <= 0.529 ? shadowYellow : v < 0.6 ? shadowGreen : shadowCyan,
  v => borderFor(v < 0.5 ? colorRed : v <= 0.529 ? colorYellow : v < 0.6 ? colorGreen : colorCyan)
)
const AvgDeaths = makeKpiCard(
  v => v >= 6 ? colorRed : v >= 5 ? colorYellow : v >= 3 ? colorGreen : colorCyan,
  v => v >= 6 ? shadowRed : v >= 5 ? shadowYellow : v >= 3 ? shadowGreen : shadowCyan,
  v => borderFor(v >= 6 ? colorRed : v >= 5 ? colorYellow : v >= 3 ? colorGreen : colorCyan)
)
const AvgObj = makeKpiCard(
  v => v < 2 ? colorRed : v < 3 ? colorYellow : v < 5 ? colorGreen : colorCyan,
  v => v < 2 ? shadowRed : v < 3 ? shadowYellow : v < 5 ? shadowGreen : shadowCyan,
  v => borderFor(v < 2 ? colorRed : v < 3 ? colorYellow : v < 5 ? colorGreen : colorCyan)
)
const GoodTempo = makeKpiCard(
  v => v < 0.35 ? colorRed : v < 0.5 ? colorYellow : v < 0.55 ? colorGreen : colorCyan,
  v => v < 0.35 ? shadowRed : v < 0.5 ? shadowYellow : v < 0.55 ? shadowGreen : shadowCyan,
  v => borderFor(v < 0.35 ? colorRed : v < 0.5 ? colorYellow : v < 0.55 ? colorGreen : colorCyan)
)
const BadTempo = makeKpiCard(
  v => v >= 0.2 ? colorRed : v >= 0.15 ? colorYellow : v >= 0.05 ? colorGreen : colorCyan,
  v => v >= 0.2 ? shadowRed : v >= 0.15 ? shadowYellow : v >= 0.05 ? shadowGreen : shadowCyan,
  v => borderFor(v >= 0.2 ? colorRed : v >= 0.15 ? colorYellow : v >= 0.05 ? colorGreen : colorCyan)
)
const TiltGames = makeKpiCard(
  v => v >= 0.15 ? colorRed : v >= 0.13 ? colorYellow : v >= 0.1 ? colorGreen : colorCyan,
  v => v >= 0.15 ? shadowRed : v >= 0.13 ? shadowYellow : v >= 0.1 ? shadowGreen : shadowCyan,
  v => borderFor(v >= 0.15 ? colorRed : v >= 0.13 ? colorYellow : v >= 0.1 ? colorGreen : colorCyan)
)

/* ─── FOCUS CYCLES ───────────────────────────────────────────────────────── */
/*  Layout: two equal-width tables side-by-side on the same row.
    The ImprovementFocusStats sits below them (in normal flow), so there's
    no hardcoded top offset and no overlap. */
const FocusCyclesSection = styled.section`
  ${sectionBase}
  flex-direction: column;
  transition: transform 0.65s ease, opacity 0.85s ease;
  ${(p) => slideCSS('Focus Cycles', p.active, p.searched)}
`

const FocusCyclesRow = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 760px) { flex-direction: column; }
`

const FocusCyclesHalf = styled.div`
  flex: 1;
  min-width: 0;
`

const focusCyclesCols = [{ w: '50%' }, { w: '50%' }]

const FocusCyclesTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${focusCyclesCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const FocusCyclesBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${focusCyclesCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

const improvementStatsCols = Array(6).fill({ w: '16.67%' })

const ImprovementFocusStatsTableHeader = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  border-radius: 12px 12px 0 0; overflow: hidden;
  position: sticky; top: 0; z-index: 30;
  th { ${sharedHeaderTh} }
  ${improvementStatsCols.map((c,i) => `th:nth-child(${i+1}) { width: ${c.w}; min-width: 70px; }`).join('\n')}
  th:first-child { border-top-left-radius: 12px; }
  th:last-child  { border-top-right-radius: 12px; }
`

const ImprovementFocusStatsBodyTable = styled.table`
  width: 100%; border-collapse: collapse; table-layout: fixed;
  td { ${(p) => sharedBodyTd(p.$d)} }
  ${improvementStatsCols.map((c,i) => `td:nth-child(${i+1}) { width: ${c.w}; min-width: 70px; }`).join('\n')}
  tbody tr:hover { background: rgba(255,255,255,0.04); }
`

const ImprovementFocusSelect = styled.select`
  width: 90%;
  appearance: none;
  -webkit-appearance: none;
  background: rgba(20, 26, 48, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(255,255,255,0.04);
  padding: ${(p) => p.$d?.improvementSelectPadding || '0.5rem'};
  border-radius: 10px;
  text-align: center;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover { background: rgba(25, 32, 56, 0.9); cursor: pointer; }
  &:focus {
    outline: none;
    border-color: #f85538;
    box-shadow: 0 6px 18px rgba(56,189,248,0.08);
    background: rgba(25, 32, 56, 0.95);
  }
`

/* ─── APP ────────────────────────────────────────────────────────────────── */
const App = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('North America')
  const [searchQuery, setSearchQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [review, setReview] = useState({})
  const [densityKey, setDensityKey] = useState('default')
  const [improvementFocus, setImprovementFocus] = useState({})

  const d = DENSITY[densityKey]

  const regionCodes = {
    'North America': 'NA1', 'Middle East': 'ME1', 'Europe West': 'EUW',
    'Europe Nordic & East': 'EUNE', 'Oceania': 'OC', 'Korea': 'KR1',
    'Japan': 'JP1', 'Brazil': 'BR1', 'LAS': 'LAS', 'LAN': 'LAN',
    'Russia': 'RU1', 'Turkiye': 'TR1', 'Southeast Asia': 'SG2',
    'Taiwan': 'TW2', 'Vietnam': 'VN2',
  }

  const currentCode = regionCodes[selectedRegion] || 'NA1'
  const placeholderText = `Game Name + #${currentCode}`
  const notesPlaceholderText = 'Example: Lost tempo taking a risky gank.'

  const handleRegionChange = (e) => setSelectedRegion(e.target.value)
  const handleSearchChange = (e) => setSearchQuery(e.target.value)
  const handleTabChange = (tab) => setActiveTab(tab)
  const handleReviewChange = (e, match, column) => {
    setReview(prev => ({ ...prev, [match]: { ...prev[match], [column]: e.target.value } }))
  }
  const handleImprovementFocusChange = (e, startdate) => {
    setImprovementFocus(prev => ({ ...prev, [startdate]: e.target.value }))
  }

  useEffect(() => { console.log(review) }, [review])

  return (
    <GlobalLayout>
      <Container>
        {/* ── HEADER ── */}
        <Header searched={searched}>
          <HeaderBrand>Jungle Improvement Tracker</HeaderBrand>

          <HeaderCenter>
            <HeaderStat>
              <HeaderStatVal>{searchQuery || '—'}</HeaderStatVal>
              <HeaderStatLbl>Summoner</HeaderStatLbl>
            </HeaderStat>
            <HeaderDivider />
            <HeaderStat>
              <HeaderStatVal>{selectedRegion || 'Unknown'}</HeaderStatVal>
              <HeaderStatLbl>Region</HeaderStatLbl>
            </HeaderStat>
            <HeaderDivider className="hide-narrow" />
            <HeaderStat className="hide-narrow">
              <HeaderStatVal>Platinum IV</HeaderStatVal>
              <HeaderStatLbl>Rank</HeaderStatLbl>
            </HeaderStat>
            <HeaderDivider className="hide-narrow" />
            <HeaderStat className="hide-narrow">
              <HeaderStatVal>50 LP</HeaderStatVal>
              <HeaderStatLbl>LP</HeaderStatLbl>
            </HeaderStat>
            <HeaderDivider className="hide-narrow" />
            <HeaderStat className="hide-narrow">
              <HeaderStatVal>
                <ImprovementFocusCD>
                  <span style={{ fontSize: '12px', color: '#f2c96b', opacity: 0.8 }}>◎</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f2c96b', letterSpacing: '0.04em' }}>First Item Timing</span>
                    <span style={{ fontSize: '0.58rem', color: 'rgba(248,250,252,0.38)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>5 days remaining</span>
                  </div>
                </ImprovementFocusCD>
              </HeaderStatVal>
            </HeaderStat>
            <HeaderDivider />
            <Legend>
              {[['rgba(0,255,255,0.75)', 'Very good'], ['rgba(0,255,0,0.75)', 'Good'], ['rgba(255,217,0,0.75)', 'Okay'], ['rgba(255,0,0,0.75)', 'Bad']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.58rem', color: 'rgba(248,250,252,0.38)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              ))}
            </Legend>
          </HeaderCenter>

          <DensityToggle>
            <DensityBtn active={densityKey === 'compact'}     onClick={() => setDensityKey('compact')}>Compact</DensityBtn>
            <DensityBtn active={densityKey === 'default'}     onClick={() => setDensityKey('default')}>Default</DensityBtn>
            <DensityBtn active={densityKey === 'comfortable'} onClick={() => setDensityKey('comfortable')}>Cozy</DensityBtn>
          </DensityToggle>
        </Header>

        {/* ── TAB BAR ── */}
        <TabBar searched={searched}>
          <TabLinks>
            {TAB_ORDER.map(tab => (
              <a
                key={tab}
                href={`#${tab.toLowerCase().replace(' ', '-')}`}
                onClick={(e) => { e.preventDefault(); handleTabChange(tab) }}
                data-active={activeTab === tab}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab}
              </a>
            ))}
          </TabLinks>
        </TabBar>

        {/* ── BANNER ── */}
        <Banner searched={searched}>
          <BannerEyebrow>Jungle</BannerEyebrow>
          <BannerTitle>Improvement Tracker</BannerTitle>
          <BannerDivider />
          <BannerTagline>
            See exactly where your jungle is winning — and where it isn't. Set an <strong>improvement focus</strong> and track your progress over time with data-driven insights.
          </BannerTagline>
          {!showForm && (
            <ActionButton onClick={() => setShowForm(true)}>Search a summoner</ActionButton>
          )}
          <FormPanel visible={showForm}>
            <CombinedForm visible={showForm}>
              <RegionUnit>
                <StyledSelect value={selectedRegion} onChange={handleRegionChange} aria-label="Region select">
                  {Object.keys(regionCodes).map(r => <option key={r} value={r}>{r}</option>)}
                </StyledSelect>
              </RegionUnit>
              <Divider />
              <SearchUnit>
                <FloatingWrapper className="form-floating">
                  <input id="search" name="search" type="text" value={searchQuery} onChange={handleSearchChange} className="form-control" placeholder={placeholderText} aria-label={placeholderText} />
                  <label htmlFor="search">{placeholderText}</label>
                </FloatingWrapper>
              </SearchUnit>
              <Divider />
              <SearchButtonUnit>
                <SearchButton onClick={() => setSearched(true)}>Search</SearchButton>
              </SearchButtonUnit>
            </CombinedForm>
          </FormPanel>
        </Banner>

        {/* ── OVERVIEW ── */}
        <Overview searched={searched} active={activeTab}>
          <Table>
            <OverviewTableHeader>
              <thead><tr>
                <th>Match</th><th>Date</th><th>Patch</th><th>Rank</th>
                <th>LP</th><th>Champion</th><th>Result</th><th>Length</th>
              </tr></thead>
            </OverviewTableHeader>
            <TableBodyWrapper>
              <OverviewBodyTable $d={d}>
                <tbody>
                  {Array.from({length:21},(_,i)=>i+1).map(n => (
                    <tr key={n}>
                      <td>{n}</td><td>2026-05-29</td><td>26.10</td><td>Platinum IV</td>
                      <td>50</td><td>Taliyah</td><td>W</td><td>30m</td>
                    </tr>
                  ))}
                </tbody>
              </OverviewBodyTable>
            </TableBodyWrapper>
          </Table>
        </Overview>

        {/* ── DETAILS ── */}
        <Details searched={searched} active={activeTab}>
          <Table>
            <DetailsTableHeader>
              <thead><tr>
                <th>#</th><th>Date</th><th>Team Kills</th><th>K</th>
                <th>D</th><th>A</th><th>CS</th><th>Dmg Dealt</th>
                <th>Vision</th><th>Kill Part%</th><th>Obj Secured</th>
                <th>1st Item</th><th>Early Tempo</th>
              </tr></thead>
            </DetailsTableHeader>
            <TableBodyWrapper>
              <DetailsBodyTable $d={d}>
                <tbody>
                  {Array.from({length:21},(_,i)=>i+1).map(n => (
                    <tr key={n}>
                      <td>{n}</td><td>2026-05-29</td><td>40</td><td>10</td><td>5</td>
                      <td>4</td><td>100</td><td>20k</td><td>30</td><td>60%</td>
                      <td>4</td><td>9:00</td><td>30%</td>
                    </tr>
                  ))}
                </tbody>
              </DetailsBodyTable>
            </TableBodyWrapper>
          </Table>
        </Details>

        {/* ── METRICS ── */}
        <Metrics searched={searched} active={activeTab}>
          <Table>
            <MetricsTableHeader>
              <thead><tr>
                <th>#</th><th>Date</th><th>CS/min</th><th>Vis/min</th>
                <th>Dmg/min</th><th>Gold Δ@10</th><th>XP Δ@10</th>
                <th>CS Δ@10</th><th>K+A Δ@10</th>
              </tr></thead>
            </MetricsTableHeader>
            <TableBodyWrapper>
              <MetricsBodyTable $d={d}>
                <tbody>
                  {Array.from({length:21},(_,i)=>i+1).map(n => (
                    <tr key={n}>
                      <td>{n}</td><td>2026-05-29</td><td>8</td><td>10</td><td>1000</td>
                      <td>+500</td><td>+100</td><td>+20</td><td>+3</td>
                    </tr>
                  ))}
                </tbody>
              </MetricsBodyTable>
            </TableBodyWrapper>
          </Table>
        </Metrics>

        {/* ── TEMPO ── */}
        <Tempo searched={searched} active={activeTab}>
          <Table>
            <TempoTableHeader>
              <thead><tr>
                <th>#</th><th>Date</th><th>Gold@10</th><th>Enemy Gold@10</th>
                <th>EXP@10</th><th>Enemy EXP@10</th><th>CS@10</th>
                <th>Enemy CS@10</th><th>K+A@10</th><th>Enemy K+A@10</th>
              </tr></thead>
            </TempoTableHeader>
            <TableBodyWrapper>
              <TempoBodyTable $d={d}>
                <tbody>
                  {Array.from({length:5},(_,i)=>i+1).map(n => (
                    <tr key={n}>
                      <td>{n}</td><td>2026-05-29</td><td>4000</td><td>3000</td><td>4000</td>
                      <td>3000</td><td>80</td><td>70</td><td>3</td><td>3</td>
                    </tr>
                  ))}
                </tbody>
              </TempoBodyTable>
            </TableBodyWrapper>
          </Table>
        </Tempo>

        {/* ── REVIEW ── */}
        <Review searched={searched} active={activeTab}>
          <Table>
            <ReviewTableHeader>
              <thead><tr>
                <th>#</th><th>Date</th><th>Gameplan</th><th>Major Mistake</th>
                <th>Mental</th><th>Focus Rating</th><th>Notes</th>
              </tr></thead>
            </ReviewTableHeader>
            <TableBodyWrapper>
              <ReviewBodyTable $d={d}>
                <tbody>
                  {[1,2,3,4,5].map(n => (
                    <tr key={n}>
                      <td>{n}</td>
                      <td>2026-05-29</td>
                      <td>
                        <ReviewSelect $d={d} aria-label="Gameplan Adherence" value={review[n]?.['Gameplan Adherence'] || ''} onChange={(e) => handleReviewChange(e, n, 'Gameplan Adherence')}>
                          <option value="" disabled hidden>--</option>
                          <option value="Good">Good</option><option value="Okay">Okay</option><option value="Bad">Bad</option>
                        </ReviewSelect>
                      </td>
                      <td>
                        <ReviewSelect $d={d} aria-label="Major Mistake" value={review[n]?.['Major Mistake'] || ''} onChange={(e) => handleReviewChange(e, n, 'Major Mistake')}>
                          <option value="" disabled hidden>--</option>
                          <option value="Positioning">Positioning</option>
                          <option value="Late Reset">Late Reset</option>
                          <option value="Emotional Play">Emotional Play</option>
                        </ReviewSelect>
                      </td>
                      <td>
                        <ReviewSelect $d={d} aria-label="Mental" value={review[n]?.['Mental'] || ''} onChange={(e) => handleReviewChange(e, n, 'Mental')}>
                          <option value="" disabled hidden>--</option>
                          <option value="Calm">Calm</option><option value="Frustrated">Frustrated</option><option value="Tilted">Tilted</option>
                        </ReviewSelect>
                      </td>
                      <td>
                        <ReviewSelect $d={d} aria-label="Improvement Focus Rating" value={review[n]?.['Improvement Focus Rating'] || ''} onChange={(e) => handleReviewChange(e, n, 'Improvement Focus Rating')}>
                          <option value="" disabled hidden>--</option>
                          <option value="Good">Good</option><option value="Okay">Okay</option><option value="Bad">Bad</option>
                        </ReviewSelect>
                      </td>
                      <td>
                        <ReviewNotes $d={d}>
                          <textarea className="form-control" placeholder={notesPlaceholderText} aria-label={notesPlaceholderText}
                            value={review[n]?.['Notes'] ?? ''} onChange={(e) => handleReviewChange(e, n, 'Notes')} />
                        </ReviewNotes>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ReviewBodyTable>
            </TableBodyWrapper>
          </Table>
        </Review>

        {/* ── WEEKLY SUMMARY ── */}
        <WeeklySummary searched={searched} active={activeTab}>
          <KpiRow>
            {/* Games Played */}
            <GamesPlayed.Outer value={9} $d={d}>
              <GamesPlayed.Inner value={9} $d={d}>
                <CardHeader $d={d}>Games Played</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>9</p>
                <GamesPlayed.Kpi $d={d}>Between 15–25</GamesPlayed.Kpi>
              </GamesPlayed.Inner>
            </GamesPlayed.Outer>
            {/* Win Rate */}
            <WinRate.Outer value={0.52} $d={d}>
              <WinRate.Inner value={0.52} $d={d}>
                <CardHeader $d={d}>Win Rate</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>52%</p>
                <WinRate.Kpi $d={d}>&gt; 52%</WinRate.Kpi>
              </WinRate.Inner>
            </WinRate.Outer>
            {/* Avg Deaths */}
            <AvgDeaths.Outer value={4} $d={d}>
              <AvgDeaths.Inner value={4} $d={d}>
                <CardHeader $d={d}>Avg Deaths</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>4</p>
                <AvgDeaths.Kpi $d={d}>&lt; 5</AvgDeaths.Kpi>
              </AvgDeaths.Inner>
            </AvgDeaths.Outer>
            {/* Avg Obj */}
            <AvgObj.Outer value={5} $d={d}>
              <AvgObj.Inner value={5} $d={d}>
                <CardHeader $d={d}>Avg Objectives</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>5</p>
                <AvgObj.Kpi $d={d}>3 or more</AvgObj.Kpi>
              </AvgObj.Inner>
            </AvgObj.Outer>
            {/* Good Tempo */}
            <GoodTempo.Outer value={0.45} $d={d}>
              <GoodTempo.Inner value={0.45} $d={d}>
                <CardHeader $d={d}>Good Tempo</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>45%</p>
                <GoodTempo.Kpi $d={d}>&gt; 50%</GoodTempo.Kpi>
              </GoodTempo.Inner>
            </GoodTempo.Outer>
            {/* Bad Tempo */}
            <BadTempo.Outer value={0.04} $d={d}>
              <BadTempo.Inner value={0.04} $d={d}>
                <CardHeader $d={d}>Bad Tempo</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>4%</p>
                <BadTempo.Kpi $d={d}>&lt; 20%</BadTempo.Kpi>
              </BadTempo.Inner>
            </BadTempo.Outer>
            {/* Tilt Games */}
            <TiltGames.Outer value={0.04} $d={d}>
              <TiltGames.Inner value={0.04} $d={d}>
                <CardHeader $d={d}>Tilt Games</CardHeader>
                <p style={{ margin: '4px 0', fontSize: d?.cardFontSize }}>4%</p>
                <TiltGames.Kpi $d={d}>&lt; 15%</TiltGames.Kpi>
              </TiltGames.Inner>
            </TiltGames.Outer>
          </KpiRow>

          <Table>
            <WeeklySummaryTableHeader>
              <thead><tr>
                <th>Week</th><th>Games</th><th>Win%</th>
                <th>Avg Deaths</th><th>Avg Obj</th><th>Good Tempo</th>
                <th>Bad Tempo</th><th>Tilt%</th><th>Start Rank</th><th>Start LP</th>
                <th>End Rank</th><th>End LP</th><th>LP Δ</th>
              </tr></thead>
            </WeeklySummaryTableHeader>
            <TableBodyWrapper>
              <WeeklySummaryBodyTable $d={d}>
                <tbody>
                  {[1,2,3].map(n => (
                    <tr key={n}>
                      <td>{n}</td><td>41</td><td>58.54%</td><td>4.95</td>
                      <td>4.07</td><td>63.41%</td><td>9.76%</td><td>9.76%</td>
                      <td>Gold II</td><td>34</td><td>Plat IV</td><td>48</td><td>+214</td>
                    </tr>
                  ))}
                </tbody>
              </WeeklySummaryBodyTable>
            </TableBodyWrapper>
          </Table>
        </WeeklySummary>

        {/* ── FOCUS CYCLES ── */}
        <FocusCyclesSection searched={searched} active={activeTab}>
          {/* Top row: focus cycles table + (future: notes or summary) */}
          <FocusCyclesRow>
            <FocusCyclesHalf>
              <Table>
                <FocusCyclesTableHeader>
                  <thead><tr><th>Start Date</th><th>Improvement Focus</th></tr></thead>
                </FocusCyclesTableHeader>
                <TableBodyWrapper style={{ maxHeight: '260px' }}>
                  <FocusCyclesBodyTable $d={d}>
                    <tbody>
                      {['2026-05-10','2026-05-24','2026-06-07'].map(date => (
                        <tr key={date}>
                          <td>{date}</td>
                          <td>
                            <ImprovementFocusSelect $d={d} aria-label="Improvement focus" value={improvementFocus[date] || ''} onChange={(e) => handleImprovementFocusChange(e, date)}>
                              <option value="" disabled hidden>-- Select --</option>
                              <option value="Reduce Deaths">Reduce Deaths</option>
                              <option value="First Item Timing">First Item Timing</option>
                              <option value="None">None</option>
                            </ImprovementFocusSelect>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </FocusCyclesBodyTable>
                </TableBodyWrapper>
              </Table>
            </FocusCyclesHalf>
          </FocusCyclesRow>

          {/* Improvement Focus Stats — sits in normal flow, never overlaps */}
          <Table>
            <ImprovementFocusStatsTableHeader>
              <thead><tr>
                <th>Focus Concept</th><th>Win Rate</th><th>Very Good</th><th>Good</th><th>Okay</th><th>Bad</th>
              </tr></thead>
            </ImprovementFocusStatsTableHeader>
            <TableBodyWrapper style={{ maxHeight: '200px' }}>
              <ImprovementFocusStatsBodyTable $d={d}>
                <tbody>
                  <tr><td>Reduce Deaths</td><td>50%</td><td>20%</td><td>30%</td><td>25%</td><td>25%</td></tr>
                  <tr><td>First Item Timing</td><td>60%</td><td>25%</td><td>35%</td><td>30%</td><td>30%</td></tr>
                  <tr><td>None</td><td>40%</td><td>15%</td><td>25%</td><td>20%</td><td>20%</td></tr>
                </tbody>
              </ImprovementFocusStatsBodyTable>
            </TableBodyWrapper>
          </Table>
        </FocusCyclesSection>
      </Container>
    </GlobalLayout>
  )
}

export default App