import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Opaque badge — iOS applies its own rounded-rect mask.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1d1d1f',
          color: '#f5f5f7',
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        GS
      </div>
    ),
    size,
  );
}
