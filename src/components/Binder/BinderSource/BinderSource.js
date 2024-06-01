import React, { useState } from 'react';
import './BinderSource.css';

function BinderSource({ source, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(source.title);
  const [editContent, setEditContent] = useState(source.content);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit(source.id, editTitle, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(source.title);
    setEditContent(source.content);
  };

  return (
    <div className="source-tile">
      {isEditing ? (
        <>
          <input 
            type="text" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
          />
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)} 
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </>
      ) : (
        <>
          <h3 className="source-title">{source.title}</h3>
          <p className="source-content">{source.content}</p>
          <div className="button-group">
            <button onClick={handleEditClick}>Edit</button>
            <button onClick={() => onDelete(source.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default BinderSource;
