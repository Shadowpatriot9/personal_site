import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"

import Main from './Main';
import S9 from './projects/s9';
import Muse from './projects/muse';
import EL from './projects/EL';
import NFI from './projects/NFI';
import Naton from './projects/Naton';
import Sos from './projects/sos';
import Sim from './projects/sim';
import Input from './Input';

import '@fontsource/lato/400.css'; 
import '@fontsource/lato/700.css'; 

// **template** import name_of_page_ from './projects/**/**';

function App() {
  return (
    <Router>
      <div>
        <Analytics id="PZ9X7E3YVX" />
        
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
          {/* <Route path="/" element={<Input />} /> */}

          {/* **template** <Route path="/projects/**" element={<name_of_page_ />} /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;


