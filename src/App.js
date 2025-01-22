import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import S9 from './projects/s9/s9';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<main />} />
          <Route path="/projects/s9" element={<S9 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


