import { ImageResponse } from 'next/og';

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get('title') || 'Grayden Scovil').slice(0, 60);
  const subtitle = (
    url.searchParams.get('subtitle') ||
    'Software and hardware — home servers, operating systems, simulators. Based in Colorado.'
  ).slice(0, 130);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '74px 80px',
          backgroundColor: '#0a0a0c',
          backgroundImage:
            'radial-gradient(900px 520px at 82% -12%, rgba(41,151,255,0.16), transparent 60%)',
          color: '#f5f5f7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 84,
              height: 84,
              borderRadius: 22,
              backgroundColor: '#f5f5f7',
              color: '#0a0a0c',
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            GS
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#98989f', letterSpacing: 1 }}>
            mgds.me
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.02,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              maxWidth: 900,
              fontSize: 34,
              lineHeight: 1.35,
              color: '#98989f',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
