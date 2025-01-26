import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Main from './Main';
import S9 from './projects/s9';
import Muse from './projects/muse';
import EL from './projects/EL';
import NFI from './projects/NFI';
import Naton from './projects/Naton';
import Sos from './projects/sos';
import Sim from './projects/sim';
// import Input from './input';

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
          <Route path="/projects/sos" element={<Sos />} />
          <Route path="/projects/sim" element={<Sim />} />
          {/* <Route path="/" element={<Input />} /> */}

          {/* **template** <Route path="/projects/**" element={<name_of_page_ />} /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;


