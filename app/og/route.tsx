import { ImageResponse } from 'next/og';

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Grayden Scovil';
  const subtitle = url.searchParams.get('subtitle') || 'Colorado — projects & experiments';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#232323',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '48px 64px',
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 700, marginBottom: 24 }}>{title}</div>
          <div style={{ fontSize: 36, color: '#cccccc' }}>{subtitle}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
