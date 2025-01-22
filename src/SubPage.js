import React from 'react';
import { Link } from 'react-router-dom';

function SubPage() {
  return (
    <div>
      <h1>Sub Page</h1>
      <p>This is the content of the subpage.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

export default SubPage;
