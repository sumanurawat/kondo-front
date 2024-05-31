import React from 'react';
import { Link } from 'react-router-dom';
import './BinderTile.css'; // Import CSS for styling

function BinderTile({ binder }) {
  return (
    <Link to={`/binder/${binder.id}`} className="binder-tile">
      <div className="binder-title">{binder.title}</div>
    </Link>
  );
}

export default BinderTile;
