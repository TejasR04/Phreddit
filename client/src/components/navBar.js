import React from 'react';

const NavBar = ({ communities, onCommunityClick, onHomeClick, onCreateCommunity }) => {
  return (
    <div className="nav-bar">
      <a href="#" className="nav-link" onClick={onHomeClick}>
        Home
      </a>
      <hr className="delimiter" />
      <button className="create-community-btn" onClick={onCreateCommunity}>
        Create Community
      </button>
      <div className="community-header">Communities</div>
      <div className="community-list">
        {communities.map((community) => (
          <a
            href="#"
            key={community.communityID}
            className="community-link"
            onClick={() => onCommunityClick(community.name)}
          >
            {community.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
