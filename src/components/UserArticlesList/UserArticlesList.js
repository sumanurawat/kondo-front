// UserArticlesList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'components/UserArticlesList/UserArticlesList.css'; // Import the CSS file here

function UserArticlesList({ articles, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="articles-container">
      <h2>Your Articles</h2>
      <ul>
        {articles.map(article => (
          <li key={article.id} className="article-item">
            <h3 className="article-title">{article.title}</h3>
            <p className="article-body">{article.body}</p>
            <button className="button edit-button" onClick={() => navigate(`/EditArticle/${article.id}`)}>Edit</button>
            <button className="button delete-button" onClick={() => onDelete(article.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserArticlesList;
