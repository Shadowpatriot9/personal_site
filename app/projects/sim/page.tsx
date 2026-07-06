import type { Metadata } from 'next';
import SubPage from '@/components/SubPage';

export const metadata: Metadata = {
  title: 'S_im',
  description: 'S_im — Shadow Simulator.',
};

export default function SimPage() {
  return (
    <SubPage
      slug="sim"
      pageTitle="S_im"
      pageDescription="Shadow Simulator"
      logData={{ dateOfOrigin: '12/2024', status: 'In Progress' }}
    >
      {/* Top Grid */}
      <div className="grid-1">
        <section id="title">
          <h1>S_im</h1>
          <p style={{ marginTop: '8px' }}>
            <strong>Shadow Simulator</strong>
          </p>
        </section>
        <section className="section" id="brief">
          <h3>Description:</h3>
          <p>
            <span>(Date of origin: 12/2024)</span>
          </p>
          WIP, see link below <br />
          <a href="https://github.com/Shadowpatriot9/S_im">Link</a>
        </section>
      </div>
    </SubPage>
  );
}
