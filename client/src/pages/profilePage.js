import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const ProfilePage = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileData = await api.getUserProfile(user._id);
        setProfile(profileData);
        const [userCommunities, userPosts, userComments] = await Promise.all([
          api.getUserCommunities(user.displayName),
          api.getUserPosts(user.displayName),
          api.getUserComments(user.displayName),
        ]);

        console.log("userCommunities", userCommunities);
        console.log("userPosts", userPosts);
        console.log("userComments", userComments);
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
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "communities":
        return (
          <div>
            {communities.length > 0 ? (
              communities.map((community) => (
                <div key={community._id}>
                  <a href={`/community/${community._id}/edit`}>
                    {community.name}
                  </a>
                  <button onClick={() => handleDeleteCommunity(community._id)}>
                    Delete
                  </button>
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
                  <a href={`/post/${post._id}/edit`}>{post.title}</a>
                  <button onClick={() => handleDeletePost(post._id)}>
                    Delete
                  </button>
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
                  <a href={`/comment/${comment._id}/edit`}>
                    {comment.postTitle}: {comment.content.substring(0, 20)}
                  </a>
                  <button onClick={() => handleDeleteComment(comment._id)}>
                    Delete
                  </button>
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

  const handleDeleteCommunity = async (communityId) => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      try {
        await api.deleteCommunity(communityId);
        setCommunities(
          communities.filter((community) => community._id !== communityId)
        );
      } catch (err) {
        setError("Failed to delete community. Please try again.");
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.deletePost(postId);
        setPosts(posts.filter((post) => post._id !== postId));
      } catch (err) {
        setError("Failed to delete post. Please try again.");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.deleteComment(commentId);
        setComments(comments.filter((comment) => comment._id !== commentId));
      } catch (err) {
        setError("Failed to delete comment. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div id="user-profile-page">
      <h1>User Profile</h1>
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
