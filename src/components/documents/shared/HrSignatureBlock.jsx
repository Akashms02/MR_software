import React from 'react'

/**
 * HR signatory block: cursive name sits on the signature line (not below it).
 */
export default function HrSignatureBlock({
  companyName,
  hrHeadName,
  hrHeadDesignation,
  stampSrc,
  closingText = 'Yours Sincerely,',
  compact = false,
}) {
  const lineWidth = compact ? 128 : 152
  const boxHeight = compact ? 40 : 48

  return (
    <div>
      <div className={compact ? 'font-bold' : 'font-semibold'}>{closingText}</div>
      <div
        className={
          compact
            ? 'mb-2 text-[9px] font-black uppercase text-gray-900'
            : 'mb-3 text-[10px] font-black uppercase text-gray-900'
        }
      >
        for {companyName},
      </div>

      {stampSrc ? (
        <>
          <div className={`mb-1 flex ${compact ? 'h-9' : 'h-11'} items-center`}>
            <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" className="max-h-full object-contain" />
          </div>
          <div className="mb-1 border-t border-gray-400" style={{ width: `${lineWidth}px` }} />
        </>
      ) : (
        <div style={{ position: 'relative', width: lineWidth, height: boxHeight, marginBottom: 4 }}>
          {/* Underline always at the very bottom */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTop: '1px solid #9ca3af' }} />
          {/* Cursive name sits just above the underline */}
          <div
            style={{
              position: 'absolute',
              left: 6,
              bottom: 4,
              fontFamily: "'Brush Script MT', cursive",
              fontSize: compact ? '18px' : '22px',
              lineHeight: 1,
              fontWeight: 700,
              color: '#be185d',
              transform: 'rotate(-4deg)',
              transformOrigin: 'left bottom',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {hrHeadName}
          </div>
        </div>
      )}

      <div
        className={
          compact
            ? 'text-[9px] font-black uppercase text-gray-950'
            : 'text-[10px] font-black uppercase tracking-wide text-gray-950'
        }
      >
        {hrHeadName}
      </div>
      <div className={compact ? 'text-[8px] font-semibold text-gray-500' : 'text-[9px] font-semibold text-gray-500'}>
        {hrHeadDesignation}
      </div>
    </div>
  )
}
