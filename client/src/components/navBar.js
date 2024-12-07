import React from 'react';
import { useUser } from "../utils/userContext";

const NavBar = ({ communities, onCommunityClick, onHomeClick, onCreateCommunity }) => {
  const { user, logoutUser } = useUser();

  // Sort communities only if user is logged in
  const sortedCommunities = user
    ? communities.sort((a, b) => {
        const userJoinedA = a.members.includes(user.displayName);
        const userJoinedB = b.members.includes(user.displayName);
        if (userJoinedA && !userJoinedB) return -1;
        if (!userJoinedA && userJoinedB) return 1;
        return 0;
      })
    : communities; // If no user, don't sort and use the original list

  return (
    <div className="nav-bar">
      <a href="#" className="nav-link" onClick={onHomeClick}>
        Home
      </a>
      <hr className="delimiter" />
      <button className="create-community-btn" onClick={onCreateCommunity} disabled={!user}>
        Create Community
      </button>
      <div className="community-header">Communities</div>
      <div className="community-list">
        {(user ? sortedCommunities : communities).map((community) => (
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
