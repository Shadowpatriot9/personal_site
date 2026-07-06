import type { Metadata } from 'next';
import SubPage from '@/components/SubPage';

export const metadata: Metadata = {
  title: 'sOS',
  description: 'sOS — Shadow Operating System.',
};

export default function SosPage() {
  return (
    <SubPage
      slug="sos"
      pageTitle="sOS"
      pageDescription="Shadow Operating System"
      logData={{ dateOfOrigin: '12/2024', status: 'Active' }}
    >
      {/* Top Grid */}
      <div className="grid-1">
        <section id="title">
          <h1>sOS</h1>
          <p style={{ marginTop: '8px' }}>
            <strong>Shadow Operating System</strong>
          </p>
        </section>
        <section className="section" id="brief">
          <h3>Description:</h3>
          <p>
            <span>(Date of origin: 12/2024)</span>
          </p>
          WIP, see link below <br />
          <a href="https://github.com/Shadowpatriot9/sOS">Link</a>
        </section>
      </div>
    </SubPage>
  );
}
