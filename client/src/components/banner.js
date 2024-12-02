import React, { useState } from 'react';

const Banner = ({ onSearch, onCreatePost, onHomeClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="banner">
      <a href="#" className="app-name" onClick={onHomeClick}>
        Phreddit
      </a>
      <input
        type="text"
        className="search-box"
        placeholder="Search Phreddit..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearch}
      />
      <button className="create-post-btn" onClick={onCreatePost}>
        Create Post
      </button>
    </div>
  );
};

export default Banner;
