import React from 'react'

const PHONE_ICON_INNER = `<path d="M9 10.5c.3 2.5 1.4 4.8 3.1 6.5s4 2.8 6.5 3.1l1.8-1.8c.2-.2.5-.3.7-.1.9.3 1.9.5 2.9.5.4 0 .7.3.7.7v2.8c0 .4-.3.7-.7.7C14.1 23 5 13.9 5 8.7c0-.4.3-.7.7-.7H8.5c.4 0 .7.3.7.7 0 1 .2 2 .5 2.9.1.3 0 .6-.2.7L9 10.5z" fill="white" transform="scale(0.7) translate(6,6)"/>`
const EMAIL_ICON_INNER = `<rect x="6" y="9" width="16" height="11" rx="1.5" fill="none" stroke="white" stroke-width="1.2"/><polyline points="6,9 14,16 22,9" fill="none" stroke="white" stroke-width="1.2"/>`
const GLOBE_ICON_INNER = `<circle cx="14" cy="14" r="7" fill="none" stroke="white" stroke-width="1.2"/><ellipse cx="14" cy="14" rx="3.5" ry="7" fill="none" stroke="white" stroke-width="1.2"/><line x1="7" y1="14" x2="21" y2="14" stroke="white" stroke-width="1.2"/><line x1="8" y1="10.5" x2="20" y2="10.5" stroke="white" stroke-width="0.8"/><line x1="8" y1="17.5" x2="20" y2="17.5" stroke="white" stroke-width="0.8"/>`

const CONTACT_ICON_SCALE = 26 / 28

function escapeXml(unsafe) {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function buildContactRowSvg(gradientId, colors, iconInner, label) {
  const maxLineChars = 34;
  let line1 = label;
  let line2 = '';
  let isMultiLine = false;

  if (label.length > maxLineChars) {
    let splitIndex = -1;
    const breakChars = ['@', ' ', '-', '_', '.'];
    for (let i = Math.min(label.length - 1, maxLineChars); i >= 12; i--) {
      if (breakChars.includes(label[i])) {
        splitIndex = i + (label[i] === '@' ? 1 : 0);
        break;
      }
    }
    if (splitIndex === -1) {
      splitIndex = maxLineChars;
    }
    line1 = label.substring(0, splitIndex).trim();
    line2 = label.substring(splitIndex).trim();
    isMultiLine = true;
  }

  const longerLineLen = Math.max(line1.length, line2.length);
  const textWidth = Math.max(186, longerLineLen * 6.2);
  const svgWidth = Math.ceil(34 + textWidth);
  const svgHeight = isMultiLine ? 38 : 26;

  let textElement = '';
  if (isMultiLine) {
    const escapedL1 = escapeXml(line1);
    const escapedL2 = escapeXml(line2);
    textElement = `<text x="34" y="13" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="400" fill="#444444" dominant-baseline="middle">${escapedL1}</text><text x="34" y="26" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="400" fill="#444444" dominant-baseline="middle">${escapedL2}</text>`;
  } else {
    textElement = `<text x="34" y="13" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="400" fill="#444444" dominant-baseline="middle">${escapeXml(label)}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colors[0]}" stopColor="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}" stopColor="${colors[1]}"/></linearGradient></defs><g transform="scale(${CONTACT_ICON_SCALE})"><circle cx="14" cy="14" r="14" fill="url(#${gradientId})"/>${iconInner}</g>${textElement}</svg>`;

  return {
    src: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`,
    width: svgWidth,
    height: svgHeight
  };
}

export const THEME_COLORS = {
  '1': {
    primary: '#166534',
    secondary: '#d97706',
    light: '#bbf7d0',
    gradientText: 'linear-gradient(90deg, #166534 0%, #d97706 60%, #166534 100%)',
    headerStripe: '',
    footerStripe: '',
    pinIcon: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#166534" stopColor="#166534"/><stop offset="100%" stop-color="#d97706" stopColor="#d97706"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#ig1)"/><path d="M16 7 C12.1 7 9 10.1 9 14 C9 19.3 16 26 16 26 C16 26 23 19.3 23 14 C23 10.1 19.9 7 16 7 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white"/></svg>`)}`
  },
  '2': {
    primary: '#2563eb',
    secondary: '#06b6d4',
    light: '#93c5fd',
    gradientText: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 60%, #2563eb 100%)',
    headerStripe: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><polygon points="0,0 794,0 794,16 680,16 660,24 0,24" fill="#2563eb"/><polygon points="0,24 660,24 680,16 794,16 794,20 682,20 662,28 0,28" fill="#06b6d4"/></svg>`)}`,
    footerStripe: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><polygon points="0,80 794,80 794,40 180,40 160,48 0,48" fill="#2563eb"/><polygon points="0,48 160,48 180,40 794,40 794,36 178,36 158,44 0,44" fill="#06b6d4"/></svg>`)}`,
    pinIcon: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb" stopColor="#2563eb"/><stop offset="100%" stop-color="#06b6d4" stopColor="#06b6d4"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#ig2)"/><path d="M16 7 C12.1 7 9 10.1 9 14 C9 19.3 16 26 16 26 C16 26 23 19.3 23 14 C23 10.1 19.9 7 16 7 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white"/></svg>`)}`
  },
  '3': {
    primary: '#047857',
    secondary: '#34d399',
    light: '#a7f3d0',
    gradientText: 'linear-gradient(90deg, #047857 0%, #34d399 60%, #047857 100%)',
    headerStripe: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><path d="M0 0 L794 0 L794 14 Q700 24 600 12 T400 18 T200 8 T0 16 Z" fill="#047857"/><path d="M0 16 Q200 8 400 18 T600 12 T794 14 L794 18 Q700 28 600 16 T400 22 T200 12 T0 20 Z" fill="#34d399"/></svg>`)}`,
    footerStripe: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><path d="M0 45 Q200 65 400 35 T794 55 L794 80 L0 80 Z" fill="#047857"/><path d="M0 38 Q200 58 400 28 T794 48 L794 55 Q700 48 600 28 T400 35 T200 45 T0 45 Z" fill="#34d399"/></svg>`)}`,
    pinIcon: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#047857" stopColor="#047857"/><stop offset="100%" stop-color="#34d399" stopColor="#34d399"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#ig3)"/><path d="M16 7 C12.1 7 9 10.1 9 14 C9 19.3 16 26 16 26 C16 26 23 19.3 23 14 C23 10.1 19.9 7 16 7 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white"/></svg>`)}`
  },
  '4': {
    primary: '#374151',
    secondary: '#f59e0b',
    light: '#9ca3af',
    gradientText: 'linear-gradient(90deg, #374151 0%, #f59e0b 60%, #374151 100%)',
    headerStripe: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><polygon points="0,0 794,0 794,15 750,15 740,24 600,24 590,15 0,15" fill="#374151"/><polygon points="750,15 794,15 794,18 753,18 743,27 603,27 593,18 0,18" fill="#f59e0b"/><circle cx="620" cy="8" r="3" fill="#f59e0b"/><circle cx="630" cy="8" r="3" fill="#9ca3af"/><circle cx="640" cy="8" r="3" fill="#9ca3af"/></svg>`)}`,
    footerStripe: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><polygon points="0,40 180,40 195,55 794,55 794,80 0,80" fill="#374151"/><polygon points="0,35 182,35 197,50 794,50 794,55 195,55 180,40 0,40" fill="#f59e0b"/><line x1="210" y1="68" x2="350" y2="68" stroke="#f59e0b" stroke-width="2"/><circle cx="360" cy="68" r="3" fill="#f59e0b"/></svg>`)}`,
    pinIcon: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#374151" stopColor="#374151"/><stop offset="100%" stop-color="#f59e0b" stopColor="#f59e0b"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#ig4)"/><path d="M16 7 C12.1 7 9 10.1 9 14 C9 19.3 16 26 16 26 C16 26 23 19.3 23 14 C23 10.1 19.9 7 16 7 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white"/></svg>`)}`
  }
};

export function loadLetterheadSettings(user) {
  try {
    const local = localStorage.getItem('custom_letterhead_settings');
    if (local) {
      const parsed = JSON.parse(local);
      if (!parsed.primaryColor || !parsed.secondaryColor) {
        const themeId = parsed.themeId || '1';
        const defaults = THEME_COLORS[themeId] || THEME_COLORS['1'];
        parsed.primaryColor = parsed.primaryColor || defaults.primary;
        parsed.secondaryColor = parsed.secondaryColor || defaults.secondary;
      }
      return parsed;
    }
  } catch (e) { }

  let compName = 'NOEL PHARMA';
  let compTagline = '(INDIA) PRIVATE LIMITED';

  if (user?.fullName) {
    const fullName = user.fullName.toUpperCase();
    if (fullName.includes('NOEL PHARMA')) {
      compName = 'NOEL PHARMA';
      compTagline = fullName.replace('NOEL PHARMA', '').trim();
    } else {
      const parts = fullName.split(' ');
      compName = parts[0];
      compTagline = parts.slice(1).join(' ');
    }
  }

  return {
    themeId: '1',
    companyName: compName,
    companyTagline: compTagline,
    phone: user?.phone || '9886024514',
    email: user?.email || 'mail-noelhr1975@gmail.com',
    website: 'www.noelpharma.com',
    address: user?.address || "Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039",
    primaryColor: '#166534',
    secondaryColor: '#d97706'
  };
}

export function getLetterheadTheme(settings = {}) {
  const themeId = settings.themeId || '1';
  const defaults = THEME_COLORS[themeId] || THEME_COLORS['1'];

  const primary = settings.primaryColor || defaults.primary;
  const secondary = settings.secondaryColor || defaults.secondary;
  const light = `${primary}44`;
  const gradientText = `linear-gradient(90deg, ${primary} 0%, ${secondary} 60%, ${primary} 100%)`;

  let headerStripe = '';
  let footerStripe = '';
  const pinIcon = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig_dyn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${primary}" stopColor="${primary}"/><stop offset="100%" stop-color="${secondary}" stopColor="${secondary}"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#ig_dyn)"/><path d="M16 7 C12.1 7 9 10.1 9 14 C9 19.3 16 26 16 26 C16 26 23 19.3 23 14 C23 10.1 19.9 7 16 7 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white"/></svg>`)}`;

  if (themeId === '1') {
    headerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><polygon points="0,4 136,4 108,22 0,22" fill="${primary}"/><polygon points="125,11 129,11 112,22 108,22" fill="${secondary}"/><polygon points="131,7 794,4 794,8 125,11" fill="${primary}"/><polygon points="0,22 112,22 107,26 0,26" fill="${secondary}"/><polygon points="129,11 794,8 794,11 120,14" fill="${secondary}"/></svg>`)}`;
    footerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><defs><linearGradient id="fsg1" x1="0" y1="0" x2="794" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${primary}" stopColor="${primary}"/><stop offset="60%" stop-color="${secondary}" stopColor="${secondary}"/><stop offset="100%" stop-color="${secondary}" stopColor="${secondary}"/></linearGradient><linearGradient id="local_fsg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${primary}" stopColor="${primary}"/><stop offset="100%" stop-color="${secondary}" stopColor="${secondary}"/></linearGradient></defs><polygon points="0,68 502,68 484,80 0,80" fill="url(#fsg1)"/><polygon points="484,80 523,54 623,54 584,80" fill="url(#fsg1)"/><polygon points="584,80 650,36 740,36 674,80" fill="url(#local_fsg1)"/><polygon points="674,80 794,0 794,80" fill="url(#local_fsg1)"/><line x1="584" y1="80" x2="650" y2="36" stroke="white" stroke-width="1.5"/><line x1="674" y1="80" x2="740" y2="36" stroke="white" stroke-width="1.5"/></svg>`)}`;
  } else if (themeId === '2') {
    headerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><polygon points="0,0 794,0 794,16 680,16 660,24 0,24" fill="${primary}"/><polygon points="0,24 660,24 680,16 794,16 794,20 682,20 662,28 0,28" fill="${secondary}"/></svg>`)}`;
    footerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><polygon points="0,80 794,80 794,40 180,40 160,48 0,48" fill="${primary}"/><polygon points="0,48 160,48 180,40 794,40 794,36 178,36 158,44 0,44" fill="${secondary}"/></svg>`)}`;
  } else if (themeId === '3') {
    headerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><path d="M0 0 L794 0 L794 14 Q700 24 600 12 T400 18 T200 8 T0 16 Z" fill="${primary}"/><path d="M0 16 Q200 8 400 18 T600 12 T794 14 L794 18 Q700 28 600 16 T400 22 T200 12 T0 20 Z" fill="${secondary}"/></svg>`)}`;
    footerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><path d="M0 45 Q200 65 400 35 T794 55 L794 80 L0 80 Z" fill="${primary}"/><path d="M0 38 Q200 58 400 28 T794 48 L794 55 Q700 48 600 28 T400 35 T200 45 T0 45 Z" fill="${secondary}"/></svg>`)}`;
  } else {
    headerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="28" viewBox="0 0 794 28"><polygon points="0,0 794,0 794,15 750,15 740,24 600,24 590,15 0,15" fill="${primary}"/><polygon points="750,15 794,15 794,18 753,18 743,27 603,27 593,18 0,18" fill="${secondary}"/><circle cx="620" cy="8" r="3" fill="${secondary}"/><circle cx="630" cy="8" r="3" fill="${primary}"/><circle cx="640" cy="8" r="3" fill="${primary}"/></svg>`)}`;
    footerStripe = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="80" viewBox="0 0 794 80"><polygon points="0,40 180,40 195,55 794,55 794,80 0,80" fill="${primary}"/><polygon points="0,35 182,35 197,50 794,50 794,55 195,55 180,40 0,40" fill="${secondary}"/><line x1="210" y1="68" x2="350" y2="68" stroke="${secondary}" stroke-width="2"/><circle cx="360" cy="68" r="3" fill="${secondary}"/></svg>`)}`;
  }

  return {
    primary,
    secondary,
    light,
    gradientText,
    headerStripe,
    footerStripe,
    pinIcon
  };
}

export function LetterheadHeader({ logoSrc, settings = {} }) {
  const theme = getLetterheadTheme(settings);

  const companyName = (settings.companyName || 'NOEL PHARMA').replace(/\bFINTECH SOLUTION\b/gi, 'FINTECH SOLUTIONS');
  const tagline = settings.companyTagline || '(INDIA) PRIVATE LIMITED';
  const phone = settings.phone || '9886024514';
  const email = settings.email || 'mail-noelhr1975@gmail.com';
  const website = settings.website || 'www.noelpharma.com';

  const contactRowPhone = buildContactRowSvg('igp', [theme.primary, theme.secondary], PHONE_ICON_INNER, phone);
  const contactRowEmail = buildContactRowSvg('ige', [theme.primary, theme.secondary], EMAIL_ICON_INNER, email);
  const contactRowGlobe = buildContactRowSvg('igg', [theme.primary, theme.secondary], GLOBE_ICON_INNER, website);

  const escapedCompanyName = escapeXml(companyName);
  const charWidth = 23;
  const estimatedTextWidth = companyName.length * charWidth + 24;
  const svgWidth = Math.min(320, Math.max(160, estimatedTextWidth));
  const useTextLength = estimatedTextWidth > 320;
  const textLengthAttr = useTextLength ? `textLength="${svgWidth - 12}" lengthAdjust="spacingAndGlyphs"` : '';

  const companySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="28" viewBox="0 0 ${svgWidth} 28"><defs><linearGradient id="compNameGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${theme.primary}" stopColor="${theme.primary}" /><stop offset="100%" stop-color="${theme.secondary}" stopColor="${theme.secondary}" /></linearGradient></defs><text x="0" y="24" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="28" letter-spacing="2" fill="url(#compNameGrad)" ${textLengthAttr}>${escapedCompanyName}</text></svg>`;
  const companyNameDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(companySvg)))}`;

  return (
    <div style={{ position: 'relative', background: '#ffffff', width: '100%', boxSizing: 'border-box', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px 28px 28px', gap: '0' }}>

        {/* LEFT GROUP: Logo, Themed Divider, and Company Name */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ flexShrink: 0, marginRight: '0px' }}>
            <img
              src={logoSrc || "/GP.png"}
              alt="GP Logo"
              crossOrigin="anonymous"
              style={{ width: '110px', height: '85px', display: 'block', objectFit: 'contain' }}
            />
          </div>

          <div style={{
            width: '2px',
            height: '56px',
            background: `linear-gradient(to bottom, ${theme.light}, ${theme.primary}, ${theme.light})`,
            margin: '0 18px',
            flexShrink: 0,
            borderRadius: '1px',
          }} />

          <div style={{ height: '85px', paddingTop: '21px', boxSizing: 'border-box', flexShrink: 0 }}>
            <div className="company-logo-text" style={{ height: '28px', display: 'block' }}>
              <img
                src={companyNameDataUrl}
                alt={companyName}
                className="company-logo-text-img"
                style={{ display: 'block', width: `${svgWidth}px`, height: '28px', objectFit: 'contain', objectPosition: 'left' }}
              />
            </div>
            <div className="company-logo-tagline" style={{
              fontFamily: 'Arial, sans-serif',
              fontWeight: 600,
              fontSize: '8.5px',
              letterSpacing: '1px',
              color: theme.secondary,
              marginTop: '4px',
              textTransform: 'uppercase',
              lineHeight: '10px',
            }}>
              {tagline}
            </div>
          </div>
        </div>

        {/* Center vertical gray divider with themed dot */}
        <div style={{ position: 'relative', width: '1.5px', height: '62px', background: '#ddd', flexShrink: 0, borderRadius: '1px' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            boxShadow: '0 0 0 2px white',
          }} />
        </div>

        {/* Contact info rows built dynamically */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <img src={contactRowPhone.src} alt="" className="offer-contact-row" data-width={contactRowPhone.width} data-height={contactRowPhone.height} style={{ display: 'block', width: `${contactRowPhone.width}px`, height: `${contactRowPhone.height}px`, marginBottom: '5px' }} />
          <img src={contactRowEmail.src} alt="" className="offer-contact-row" data-width={contactRowEmail.width} data-height={contactRowEmail.height} style={{ display: 'block', width: `${contactRowEmail.width}px`, height: `${contactRowEmail.height}px`, marginBottom: '5px' }} />
          <img src={contactRowGlobe.src} alt="" className="offer-contact-row" data-width={contactRowGlobe.width} data-height={contactRowGlobe.height} style={{ display: 'block', width: `${contactRowGlobe.width}px`, height: `${contactRowGlobe.height}px` }} />
        </div>
      </div>

      <img
        src={theme.headerStripe}
        alt=""
        className="offer-theme-decor offer-theme-header-stripe"
        style={{ display: 'block', width: '100%', height: '28px', flexShrink: 0 }}
      />
    </div>
  )
}

export function LetterheadFooter({ settings = {} }) {
  const theme = getLetterheadTheme(settings);
  const address = settings.address || "Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039";

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      background: '#ffffff',
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 20,
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
    }}>
      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        padding: '24px 28px 48px 28px',
        gap: '0',
      }}>
        <img
          src={theme.pinIcon}
          alt=""
          style={{ width: '32px', height: '32px', flexShrink: 0, marginRight: '14px' }}
        />

        <div style={{
          width: '1.5px',
          height: '44px',
          background: `linear-gradient(to bottom, ${theme.light}, ${theme.primary}, ${theme.light})`,
          marginRight: '16px',
          flexShrink: 0,
          borderRadius: '1px',
        }} />

        <div style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          color: '#666',
          lineHeight: 1.65,
          fontWeight: 400,
          maxWidth: '360px',
        }}>
          {address}
        </div>
      </div>

      <img
        src={theme.footerStripe}
        alt=""
        className="offer-theme-decor offer-theme-footer-stripe"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '80px',
          display: 'block',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export function applyLetterheadContactPdfFixes(clonedDoc) {
  clonedDoc.querySelectorAll('.offer-contact-row').forEach((img) => {
    const w = img.getAttribute('data-width') || '220';
    const h = img.getAttribute('data-height') || '26';
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    img.setAttribute('width', w);
    img.setAttribute('height', h);
  })
  clonedDoc.querySelectorAll('.company-logo-text-img').forEach((img) => {
    const currentWidth = img.style.width || '320px';
    const currentHeight = img.style.height || '28px';
    img.style.width = currentWidth;
    img.style.height = currentHeight;
    img.setAttribute('width', currentWidth.replace('px', ''));
    img.setAttribute('height', currentHeight.replace('px', ''));
  })
}

const oklchToRgb = (l, c, h, a = 1) => {
  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad); const b_ = c * Math.sin(hRad);
  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.2914855480 * b_;
  const l3 = l_ ** 3; const m3 = m_ ** 3; const s3 = s_ ** 3;
  const rr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
  const gr = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const br = -0.0041960863 * l3 - 0.7034185145 * m3 + 1.7076147010 * s3;
  const f = x => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  const r = Math.max(0, Math.min(255, Math.round(f(rr) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(gr) * 255)));
  const b2 = Math.max(0, Math.min(255, Math.round(f(br) * 255)));
  return a === 1 ? `rgb(${r},${g},${b2})` : `rgba(${r},${g},${b2},${a})`;
};

const oklabToRgb = (l, a_, b_, a = 1) => {
  const L = l;
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  const r_raw = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
  const g_raw = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_raw = -0.0041960863 * l3 - 0.7034185145 * m3 + 1.7076147010 * s3;
  const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  const r = Math.max(0, Math.min(255, Math.round(f(r_raw) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(g_raw) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(b_raw) * 255)));
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const resolveModernColors = (colorStr) => {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  let resolved = colorStr;
  if (resolved.includes('oklch')) {
    try {
      resolved = resolved.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
        const parts = p1.trim().split(/[\s/,]+/);
        if (parts.length >= 3) {
          let l = parseFloat(parts[0]); if (parts[0].includes('%')) l /= 100;
          const c = parseFloat(parts[1]); const h = parseFloat(parts[2]);
          let a = 1; if (parts[3]) { a = parseFloat(parts[3]); if (parts[3].includes('%')) a /= 100; }
          if (!isNaN(l) && !isNaN(c) && !isNaN(h)) return oklchToRgb(l, c, h, a);
        }
        return match;
      });
    } catch (e) { }
  }
  if (resolved.includes('oklab')) {
    try {
      resolved = resolved.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
        const parts = p1.trim().split(/[\s/,]+/);
        if (parts.length >= 3) {
          let l = parseFloat(parts[0]); if (parts[0].includes('%')) l /= 100;
          const a_coord = parseFloat(parts[1]); const b_coord = parseFloat(parts[2]);
          let a = 1; if (parts[3]) { a = parseFloat(parts[3]); if (parts[3].includes('%')) a /= 100; }
          if (!isNaN(l) && !isNaN(a_coord) && !isNaN(b_coord)) return oklabToRgb(l, a_coord, b_coord, a);
        }
        return match;
      });
    } catch (e) { }
  }
  return resolved;
};
