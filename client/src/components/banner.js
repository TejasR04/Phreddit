import React, { useState } from 'react';
import { useUser } from '../utils/userContext';
const Banner = ({ onSearch, onCreatePost, onWelcomeClick }) => {
  const { user, logoutUser } = useUser(); // Get the current user and the logout function
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleCreatePost = () => {
    // Disable create post if user is a guest
    if (!user) return;
    onCreatePost();
  };

  const handleLogout = () => {
    logoutUser();
    onWelcomeClick();
  }

  return (
    <div className="banner">
      <a href="#" className="app-name" onClick={onWelcomeClick}>
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
      
      {/* Create Post button */}
      <button 
        className={`create-post-btn ${!user ? 'disabled' : ''}`} 
        onClick={handleCreatePost}
        disabled={!user} // Disable the button if user is a guest
      >
        Create Post
      </button>

      {/* Profile button */}
      <button className="profile-btn">
        {user ? user.displayName : 'Guest'}
      </button>

      {/* Logout button, visible only if user is logged in */}
      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
};

export default Banner;
