import type { Metadata } from 'next';
import SubPage, { Discontinued } from '@/components/SubPage';

export const metadata: Metadata = {
  title: 'NFI',
  description: 'NFI — Rocket Propulsion System concept.',
};

export default function NfiPage() {
  return (
    <SubPage
      slug="nfi"
      pageTitle="NFI"
      pageDescription="Rocket Propulsion System"
      logData={{ dateOfOrigin: '10/2020', status: 'Discontinued (05/2021)' }}
    >
      {/* Top Grid */}
      <div className="grid-1">
        <section id="title">
          <h1>NFI</h1>
          <p style={{ marginTop: '8px' }}>
            <strong>Rocket Propulsion System</strong>
          </p>
        </section>
        <section className="section" id="brief">
          <h3>Description:</h3>
          <p>
            <span>(Date of origin: 10/2020)</span>
          </p>
          <Discontinued date="05/2021" />
          NFI was a project that I started in October of 2020. The goal of the project was to
          design and create a rocket propulsion system aimed to achieve a more efficient way of
          travel for a 2nd-stage rocket launch vehicle to acomplish a long distance journey in an
          optimial time (e.g. journey to Jupiter). The project itself went no more past the
          conceptual phase in design as the main limitation to the project was a lack of
          education/knowledge in developing this system indepently as intended. However, I&apos;m
          showcasing this incomplete archived project here because during my exploration in
          developing this system allowed for a lot of self reflection and reignited my interest in
          engineering to which led to my personal transition of moving to a different location and
          pursue higher education further in an engineering discipline with the application of
          aerospace.
        </section>
      </div>

      {/* Mid Grid */}
      <div className="grid-2">
        <section className="section" id="background">
          <h3>Background:</h3>
          The design of the system had a few core and sub systems apart from the generic main
          compents of a traditional/basic propulsion system. As I debated and went several
          iterations of what the influence or main direction to the design would become, the main
          influence of the concept revolved around the idea of reigniting an old idea and apply it
          with modern capabilities.
          <br />
          <br />
          More specifically, it revolved around this idea called the &quot;Bussard Ramjet&quot; (
          <a href="https://en.wikipedia.org/wiki/Bussard_ramjet">Link</a>) that was introduced in
          1960 by a pyhsicist named Robert Bussard. The idea was to (in theory) collect hydrogen
          gas in space during travel and use it as a fuel source for a rocket propulsion system
          simtaneously in transit by deploying a large magnetic field to collect the gas as the
          launch vehicle continued. The idea was never implemented due to the lack of technology as
          well as our limited data of space in general, but the idea was continiously revisted over
          the years with each revisition having a complication of implementation primarily due to
          the lack of technology.
          <br />
          <br />
        </section>
        <section className="section" id="concept">
          <h3>Concept:</h3>
          Core:
          <li> </li>
          <br />
          Sub:
          <li> </li>
        </section>
      </div>
    </SubPage>
  );
}
