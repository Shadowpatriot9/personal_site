import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Main from './main';
import S9 from './projects/s9/s9';
import Muse from './projects/muse/muse';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/projects/s9" element={<S9 />} />
          <Route path="/projects/muse" element={<Muse />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


