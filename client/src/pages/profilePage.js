import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const ProfilePage = ({ setCurrentView, setIsEdit, setEditData }) => {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);   
  const [profile, setProfile] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState(user?.isAdmin ? "users" : "posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isAdmin && activeTab === "users") {
          fetchAllUsers();
        }
        const targetUser = selectedUser || user;
        const profileData = await api.getUserProfile(targetUser._id);
        setProfile(profileData);
        const [userCommunities, userPosts, userComments] = await Promise.all([
          api.getUserCommunities(targetUser.displayName),
          api.getUserPosts(targetUser.displayName),
          api.getUserComments(targetUser.displayName),
        ]);
        console.log(userComments);

        setCommunities(userCommunities);
        setPosts(userPosts);
        setComments(userComments);
      } catch (err) {
        setError("Failed to fetch profile information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, isAdmin, activeTab, selectedUser]);

  const handleBackToAdmin = () => {
    setSelectedUser(null);
    setActiveTab("users");
  };

  const fetchAllUsers = async () => {
    try {
      const users = await api.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This will also delete all their communities, posts and comments."
      )
    ) {
      try {
        await api.deleteUser(userId);
        setAllUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <div>
            {allUsers.length > 0 ? (
              allUsers.map((user) => (
                <div key={user._id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedUser(user);
                      setActiveTab("posts");
                    }}
                  >
                    {user.displayName} ({user.email}) - Reputation:{" "}
                    {user.reputation}
                  </a>
                  {user.isAdmin !== true && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </div>
        );
      case "communities":
        return (
          <div>
            {communities.length > 0 ? (
              communities.map((community) => (
                <div key={community._id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEdit(true);
                      setEditData(community);
                      setCurrentView("newCommunity");
                    }}
                  >
                    {community.name}
                  </a>
                </div>
              ))
            ) : (
              <p>No communities created by you.</p>
            )}
          </div>
        );
      case "posts":
        return (
          <div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEdit(true);
                      setEditData(post);
                      setCurrentView("newPost");
                    }}
                  >
                    {post.title}
                  </a>
                </div>
              ))
            ) : (
              <p>No posts created by you.</p>
            )}
          </div>
        );
      case "comments":
        return (
          <div>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEdit(true);
                      setEditData(comment);
                      setCurrentView("newComment");
                    }}
                  >
                    {comment.postTitle}: {comment.content.length > 20 ? comment.content.substring(0, 20) + "..." : comment.content}
                  </a>
                </div>
              ))
            ) : (
              <p>No comments created by you.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div id="user-profile-page">
      <h1>
        {selectedUser ? (
          <>
            {selectedUser.displayName}'s Profile
            <div className="tabs">
              <button onClick={handleBackToAdmin}>Back to Users</button>
            </div>
          </>
        ) : (
          "User Profile"
        )}
      </h1>
      {profile && (
        <div>
          <p>Display Name: {profile.displayName}</p>
          <p>Email: {profile.email}</p>
          <p>
            Member since: {new Date(profile.createdDate).toLocaleDateString()}
          </p>
          <p>Reputation: {profile.reputation}</p>
        </div>
      )}
      <div className="tabs">
        {isAdmin && !selectedUser && (
          <button onClick={() => handleTabChange("users")}>Users</button>
        )}
        <button onClick={() => handleTabChange("communities")}>
          Communities
        </button>
        <button onClick={() => handleTabChange("posts")}>Posts</button>
        <button onClick={() => handleTabChange("comments")}>Comments</button>
      </div>
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePage;
