import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="subpage" id="body2">
      <header id="header" role="banner">
        <Link href="/" aria-label="Return to homepage">
          <button id="gs-btn" title="Return to homepage">
            GS
          </button>
        </Link>
      </header>

      <main role="main">
        <div className="container">
          <div className="grid-1">
            <section id="title">
              <h1>404</h1>
              <p style={{ marginTop: '8px' }}>
                <strong>Page Not Found</strong>
              </p>
            </section>
            <section className="section" id="brief">
              <h3>Well, this is awkward.</h3>
              <p>
                That page doesn&apos;t exist. Head back{' '}
                <Link href="/">home</Link> and try again.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
