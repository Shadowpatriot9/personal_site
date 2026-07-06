import type { Metadata } from 'next';
import SubPage from '@/components/SubPage';

export const metadata: Metadata = {
  title: 'S9',
  description: 'S9 — Shadow Home Server. NAS, VM hosting, remote access, and monitoring.',
};

export default function S9Page() {
  return (
    <SubPage
      slug="s9"
      pageTitle="S9"
      pageDescription="Shadow Home Server"
      logData={{
        dateOfOrigin: '10/2024',
        features: ['NAS File System', 'VM Hosting', 'Remote Access', 'Monitoring', 'Auto Config'],
      }}
    >
      {/* Top Grid */}
      <div className="grid-1">
        <section id="title">
          <h1>S9</h1>
          <p style={{ marginTop: '8px' }}>
            <strong>Shadow Home Server</strong>
          </p>
        </section>
        <section className="section" id="brief" aria-labelledby="description-heading">
          <h2 id="description-heading">
            Description:{' '}
            <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>
              (Date of origin: 10/2024)
            </span>
          </h2>
          <p>
            This is some info about my home server. I mainly use it for redundancy to my PAN and in
            specific cases to allow more integration all around for files or other client-to-client
            connections. Trying to develop it further as an all-around hosting platform idea for
            software development purposes, but still working out the kinks to optimize the
            development workflow on it. Feel free to check her out below. 😊
          </p>
        </section>
      </div>

      {/* Mid Grid */}
      <div className="grid-2">
        <section className="section" id="features" aria-labelledby="features-heading">
          <h2 id="features-heading">Features:</h2>
          <ul>
            <li>Backup NAS File System (NAS via NFS)</li>
            <li>VM Hosting (VirtualBox w/specific OS imaged to preference)</li>
            <li>Accessible Anywhere (SSH and AnyDesk for RDP)</li>
            <li>Monitoring (HTOP, WireShark, Prometheus)</li>
            <li>Auto Config Script, Auto Install ISO for re-imaging purposes</li>
          </ul>
        </section>
        <section className="section" id="specs" aria-labelledby="specs-heading">
          <h2 id="specs-heading">Specifications:</h2>
          OS: Ubuntu Server w/GNOME Desktop
          <br /> CPU: i7-13700K
          <br /> RAM: 32GB DDR5 5600
          <br /> Storage: 1TB NVMe
          <br /> Secret Name: Sally
        </section>
      </div>

      {/* Bot Grid */}
      <div className="grid-3">
        <section className="section" id="monitor" aria-labelledby="monitor-heading">
          <h2 id="monitor-heading">Monitoring Dashboard</h2>
          <div id="status-container">
            <p>Status:</p>
            <div id="status-indicator" aria-live="polite" role="status"></div>
          </div>
          <p>Network Traffic:</p>
          <canvas id="myChart" aria-label="Network traffic chart" role="img"></canvas>
        </section>
      </div>
    </SubPage>
  );
}
