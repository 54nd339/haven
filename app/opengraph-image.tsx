import { ImageResponse } from 'next/og';

import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants';

export const alt = APP_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #09090b 0%, #1a0533 50%, #09090b 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Shield icon */}
      <svg width="120" height="120" viewBox="0 0 32 32" style={{ marginBottom: 32 }}>
        <path
          d="M16 1L3 8v9c0 7.5 5.25 13.25 13 15.5 7.75-2.25 13-8 13-15.5V8L16 1Z"
          fill="#7c3aed"
        />
        <path
          d="M12.5 11v10M19.5 11v10M12.5 16h7"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: 'white',
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}
      >
        {APP_NAME}
      </div>

      <div
        style={{
          fontSize: 24,
          color: '#a1a1aa',
          maxWidth: 600,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {APP_DESCRIPTION}
      </div>
    </div>,
    { ...size },
  );
}
