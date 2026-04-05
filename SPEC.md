# 赛博祭祖 (Cyber Zhen Zu) - Digital Ancestor Worship App

## 1. Project Overview

**Project Name**: 赛博祭祖 (Cyber Zhen Zu)
**Type**: Interactive web application / digital ritual platform
**Core Functionality**: A cyberpunk-styled digital ancestor memorial system that combines traditional Chinese ancestor worship rituals with futuristic neon aesthetics. Users can create digital ancestral shrines, burn offerings, light incense, ring bells, and maintain a family tree.
**Target Users**: Chinese diaspora, tech-savvy individuals who want to maintain cultural connections to their ancestors in a modern format.

---

## 2. Visual & Rendering Specification

### Scene Setup
- **Layout**: Full-screen dark interface with a central shrine area
- **Navigation**: Left sidebar with navigation icons
- **Background**: Deep dark gradient with animated subtle particle/glyph field (Chinese characters floating)
- **Overall mood**: Solemn, atmospheric, reverent but futuristic

### Color Palette
- **Primary Background**: `#0a0a0f` (near-black)
- **Secondary Background**: `#111118` (dark panel)
- **Accent Red (Chinese tradition)**: `#e63946` (neon vermillion)
- **Gold Accent**: `#f4a825` (warm gold)
- **Electric Cyan**: `#00e5ff` (cyber accent)
- **Text Primary**: `#f0ece3` (warm off-white)
- **Text Secondary**: `#7a7570` (muted)
- **Glow**: Red/cyan bokeh glow effects

### Typography
- **Chinese Font**: "ZCOOL XiaoWei" (Google Fonts) - for headings and altar text
- **English Font**: "Space Mono" (Google Fonts) - for UI labels
- **Calligraphy Style**: CSS text-shadow for glowing effect

### Visual Style
- **Theme**: "Neon Taoism" - traditional Chinese symbolism rendered in cyberpunk neon
- **Shrine Design**: 3D-ish altar with holographic glow edges
- **Particle Effects**: Floating 祥云 (auspicious clouds) particles, ember particles near fire
- **Animations**: CSS + Framer Motion, 60fps

### 3D Assets / Visual Elements
- CSS-only shrine/altar construction (no external 3D models needed)
- SVG icons for all ritual objects
- Canvas particle system for incense smoke and fire embers
- CSS animations for lantern flicker, bell swing

---

## 3. Application Structure

### Pages / Sections

1. **祭坛 (Altar)** - Main shrine view with ancestor photos and active offerings
2. **香火 (Incense)** - Browse and light virtual incense
3. **供品 (Offerings)** - Food, tea, flower offerings
4. **家谱 (Family Tree)** - Interactive family tree view
5. **祭日 (Memorial Days)** - Upcoming memorial dates with countdown
6. **祈福 (Prayers)** - Write and display prayer messages
7. **元宝 (Paper Offerings)** - Burn paper gold/silver ingots and spirit money

### Navigation
- Left sidebar: icon-based navigation
- Each section transitions with a fade + slide effect

---

## 4. Component Specification

### 4.1 AltarView (Main Shrine)
- Central ancestor tablet (牌位) with glowing border
- 2-4 ancestor photos in circular frames with neon glow
- Active incense sticks displayed in incense holder
- Altar table with offerings (food, tea)
- Animated lantern on each side (flickering)
- Bell on right side - clickable to ring
- Stone tablet/pedestal base

### 4.2 Incense System
- Select from 3 incense types: 檀香 (sandalwood), 沉香 (agarwood), 艾草 (mugwort)
- Click to light - flame animation appears
- Smoke particles rise from burning tip (canvas animation)
- Each stick burns for ~60 seconds with countdown
- After burn: ash falls animation
- Incense counter (香火数) displayed

### 4.3 Offerings Table
- 6 offering slots on altar table
- Types: 水果 (fruits), 茶 (tea), 酒 (rice wine), 糕点 (sweets), 鲜花 (flowers), 粽子 (zongzi)
- Click offering to place it on altar with animation
- Hovering shows offering description
- "撤供" (remove offering) button

### 4.4 Paper Offerings (元宝)
- Grid of paper offering items: 金元宝 (gold ingot), 银元宝 (silver ingot), 纸钱 (spirit money), 纸衣服 (spirit clothes), 纸房子 (spirit house)
- Click to add to burning zone
- Fire animation (canvas): orange/red flame with ember particles rising
- Items turn to ash with particle dissolve effect
- Counter showing total items burned

### 4.5 Family Tree
- Tree graph visualization using D3 or CSS grid
- Nodes: avatar circle + name + generation indicator
- Lines connecting parent-child relationships
- Click node to set as active ancestor on altar
- "添加祖先" (add ancestor) form: name, birth year, death year, photo upload, generation
- Generation labels: 祖 (ancestor), 考 (paternal), 妣 (maternal)

### 4.6 Memorial Days
- List of upcoming memorial dates
- Each entry: ancestor name, date, days remaining countdown
- Color-coded: red for approaching (within 7 days), gold for passed
- "提醒" (remind) button (stores in localStorage)
- 自动祭祖: if memorial day passes and no ritual done, shows notification

### 4.7 Prayer Board
- Text input for prayer message (max 200 chars)
- Messages displayed in "bulletin board" style with timestamp
- Messages float up and fade like 孔明灯 (sky lantern)
- Filter by: all / family / personal
- Click to "light" the prayer - lantern animation floats up

### 4.8 Bell (钟)
- SVG bell with clapper
- Click to ring: swing animation + audio chime
- Sound plays when bell swings past center

### 4.9 Ritual Sequence Mode
- "开始祭祀" (begin ritual) button on altar
- Guided step-by-step ritual:
  1. 点香 (light incense) - 3 sticks
  2. 献供 (present offerings)
  3. 敬酒 (pour wine tea)
  4. 上香 (offer incense) - bowing animation
  5. 叩拜 (kowtow) - 3 knock sounds
  6. 鸣钟 (ring bell) - 3 rings
  7. 化纸 (burn offerings)
  8. 祈福 (pray) - message input
- Progress bar at top, each step highlights

---

## 5. Data Model

### Ancestor
```typescript
interface Ancestor {
  id: string;
  name: string;
  generation: 'zǔ' | 'kǎo' | 'bǐ';
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string; // base64 or URL
  relationship?: string;
  bio?: string;
}
```

### Offering
```typescript
interface Offering {
  id: string;
  type: 'fruit' | 'tea' | 'wine' | 'sweet' | 'flower' | 'zongzi';
  placedAt?: number; // timestamp
}
```

### PaperOffering
```typescript
interface PaperOffering {
  id: string;
  type: 'gold_ingot' | 'silver_ingot' | 'spirit_money' | 'spirit_clothes' | 'spirit_house';
  quantity: number;
}
```

### Prayer
```typescript
interface Prayer {
  id: string;
  text: string;
  timestamp: number;
  author?: string;
  type: 'family' | 'personal';
  lit: boolean;
}
```

### MemorialDay
```typescript
interface MemorialDay {
  id: string;
  ancestorId: string;
  date: string; // MM-DD format
  label?: string; // e.g. "忌日" (death anniversary)
}
```

### RitualState
```typescript
interface RitualState {
  active: boolean;
  currentStep: number;
  incenseLit: number;
  offeringsPlaced: string[];
  paperBurned: number;
}
```

---

## 6. Technical Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v3
- **Animation**: Framer Motion
- **Particles**: Canvas API (custom)
- **State**: Zustand
- **Storage**: localStorage (all data persisted)
- **Fonts**: Google Fonts (ZCOOL XiaoWei, Space Mono)
- **Sharing**: html2canvas (screenshot capture), qrcode (canvas QR generation), qrcode.react (inline SVG QR), native Web Share API

---

## 7. Sharing & Social裂变

### ShareModal
- Header "分享祭坛" button in the app header bar (cyan styled, right side)
- Opens a centered modal with animated entrance
- **Preview area**: auto-captures the altar DOM (`data-altar-capture`) via html2canvas on mount
- **QR Code section**: displays QRCodeSVG encoding `https://yunbai.bago.top/` with app stats
- **Social buttons**: WeChat (clipboard), Weibo (weibo share), QQ (QQ share), Download image
- **Copy link**: clipboard copy of share URL with confirmation feedback
- **Download**: composites altar screenshot + footer with app branding, QR code (via `qrcode` canvas API), and URL onto a single PNG file for download

### Share URL
- Primary: `https://yunbai.bago.top/`
- All QR codes and sharing links point to this URL

---

## 8. Acceptance Criteria

1. **Altar renders** with at least one demo ancestor, proper layout, and atmospheric styling
2. **Incense can be lit**, burns with animated smoke, and countdown works
3. **Bell can be rung** with animation and audio
4. **Paper offerings** can be burned with fire animation and ash effect
5. **Family tree** displays and allows adding new ancestors
6. **Memorial dates** show countdown to next event
7. **Prayers** can be written and "light" animation plays
8. **Ritual sequence** guides through all 8 steps
9. **All data persists** in localStorage across page reloads
10. **Responsive** works on desktop (primary) and tablet
11. **No console errors** on load or interaction
12. **Share modal** opens from header button, captures altar screenshot, shows QR code for `https://yunbai.bago.top/`, supports download as PNG with QR and URL embedded
