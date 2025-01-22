import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import S9 from './projects/s9/s9';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/projects/s9" element={<S9 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


