import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Main from './main';
import S9 from './projects/s9/s9';
import Muse from './projects/muse/muse';
import EL from './projects/eye-learn/EL';
import NFI from './projects/nfi/NFI';
import Naton from './projects/naton/Naton';
import sos from './projects/sos/sos';
import sim from './projects/sim/sim';

// **template** import name_of_page_ from './projects/**/**';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/projects/s9" element={<S9 />} />
          <Route path="/projects/muse" element={<Muse />} />
          <Route path="/projects/EL" element={<EL />} />
          <Route path="/projects/NFI" element={<NFI />} />
          <Route path="/projects/Naton" element={<Naton />} />
          <Route path="/projects/sos" element={<sos />} />
          <Route path="/projects/sim" element={<sim />} />

          {/* **template** <Route path="/projects/**" element={<name_of_page_ />} /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;


