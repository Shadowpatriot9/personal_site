import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Main from './Main';
import S9 from './projects/s9';
import Muse from './projects/muse';
import EL from './projects/EL';
import NFI from './projects/NFI';
import Naton from './projects/Naton';
import Sos from './projects/sos';
import Sim from './projects/sim';
import Input from './Input';

// **template** import name_of_page_ from './projects/**/**';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0,0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <div>
      {/* Global Font Family */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link href="https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&display=swap" rel="stylesheet" />

      {/* Vercel Analytics */}
      <Analytics id="PZ9X7E3YVX" />

      <ScrollToTop />

      {/* Main to Sub Page Setup */}  
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/projects/s9" element={<S9 />} />
          <Route path="/projects/muse" element={<Muse />} />
          <Route path="/projects/EL" element={<EL />} />
          <Route path="/projects/NFI" element={<NFI />} />
          <Route path="/projects/Naton" element={<Naton />} />
          <Route path="/projects/sos" element={<Sos />} />
          <Route path="/projects/sim" element={<Sim />} />
          <Route path="/Input" element={<Input />} />

          {/* **template** <Route path="/projects/**" element={<name_of_page_ />} /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;


