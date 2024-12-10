import React, { useState, useEffect } from "react";
import Banner from "../components/banner.js";
import NavBar from "../components/navBar.js";
import HomePage from "../pages/homePage";
import CommunityPage from "../pages/communityPage";
import NewCommentPage from "../pages/newCommentPage";
import NewCommunityPage from "../pages/newCommunityPage";
import NewPostPage from "../pages/newPostPage";
import PostPage from "../pages/postPage";
import SearchResultsPage from "../pages/searchResultsPage";
import WelcomePage from "../pages/welcomePage.js";
import ProfilePage from "../pages/profilePage";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";
import { set } from "mongoose";

const Phreddit = () => {
  const [postID, setPostID] = useState(null);
  const [currentView, setCurrentView] = useState("welcome");
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [parentCommentID, setParentCommentID] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  // State to track membership status
  const [isMember, setIsMember] = useState(false);

  // Function to handle membership change
  const handleMembershipChange = (status) => {
    setIsMember(status);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      // If the user is logged in, set the view to "home"
      setCurrentView("home");
    }
  }, []);
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const allCommunities = await api.getAllCommunities();
        const sortedCommunities = user
          ? allCommunities.sort((a, b) => {
              const userJoinedA = a.members.includes(user._id);
              const userJoinedB = b.members.includes(user._id);
              if (userJoinedA && !userJoinedB) return -1;
              if (!userJoinedA && userJoinedB) return 1;
              return 0;
            })
          : allCommunities;
        setCommunities(sortedCommunities);
      } catch (err) {
        setError("Failed to load communities");
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [user, currentView]);

  useEffect(() => {
    const handleCommunityCreated = (event) => {
      setCommunities(event.detail.communities);
    };

    window.addEventListener("communityCreated", handleCommunityCreated);

    return () => {
      window.removeEventListener("communityCreated", handleCommunityCreated);
    };
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setCurrentView("search");
  };

  const handleCreatePost = () => {
    setIsEdit(false);
    setEditData(null);
    setCurrentView("newPost");
  };
  
  const handleProfileClick = () => {
    setCurrentView("profile");
  };

  const handleHomeClick = () => {
    setCurrentView("home");
  };

  const handleWelcomeClick = () => {
    setCurrentView("welcome");
  };

  const handleCreateCommunity = () => {
    setIsEdit(false);
    setEditData(null);
    setCurrentView("newCommunity");
  };

  const handleCommunityClick = (communityName) => {
    setSelectedCommunity(communityName);
    setCurrentView("community");
  };

  const handlePostClick = async (postID) => {
    try {
      await api.incrementViews(postID);
      setSelectedPost(postID);
      setCurrentView("post");
    } catch (err) {
      console.error("Error incrementing post views:", err);
    }
  };

  const handleReplyClick = (commentID) => {
    setIsEdit(false);
    setEditData(null);
    setParentCommentID(commentID);
    setCurrentView("newComment");
  };

  const handleRegisterSubmit = async (userData) => {
    try {
      const response = await api.register(userData);
      setCurrentView("welcome");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const handleLoginSubmit = async (loginData) => {
    try {
      const response = await api.login(loginData);
      setCurrentView("home");
    } catch (error) {
      console.error("Error logging in user:", error);
    }
  };

 
  const errorMessage = error ? "Error loading communities" : "";
  const renderView = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    switch (currentView) {
      case "home":
        return <HomePage api={api} onPostClick={handlePostClick} />;
      case "community":
        return (
          <CommunityPage
            api={api}
            communityName={selectedCommunity}
            onPostClick={handlePostClick}
          />
        );
      case "newCommunity":
        return (
          <NewCommunityPage
            api={api}
            setCurrentView={setCurrentView}
            setSelectedCommunity={setSelectedCommunity}
            isEdit={isEdit}
            editData={editData}
          />
        );
      case "newPost":
        return (
          <NewPostPage 
            api={api} 
            setCurrentView={setCurrentView}
            isEdit={isEdit}
            editData={editData}
          />
        );
      case "post":
        return (
          <PostPage
            api={api}
            postID={selectedPost}
            setCurrentView={setCurrentView}
            handleReplyClick={handleReplyClick}
          />
        );
      case "profile":
        return (
          <ProfilePage
            setCurrentView={setCurrentView}
            setIsEdit={setIsEdit}
            setEditData={setEditData}
          />
        );
      case "newComment":
        return (
          <NewCommentPage
            api={api}
            setCurrentView={setCurrentView}
            postID={selectedPost}
            parentCommentID={parentCommentID}
            isEdit={isEdit}
            editData={editData}
          />
        );
      case "search":
        return (
          <SearchResultsPage
            api={api}
            query={searchQuery}
            onPostClick={handlePostClick}
          />
        );
      case "welcome":
        return (
          <WelcomePage
            handleRegisterSubmit={handleRegisterSubmit}
            handleLoginSubmit={handleLoginSubmit}
            errorMessage={errorMessage}
            setCurrentView={setCurrentView}
          />
        );
      default:
        return <HomePage api={api} onPostClick={handlePostClick} />;
    }
  };

  return (
    <div className="phreddit-app">
      <Banner
        onSearch={handleSearch}
        onCreatePost={handleCreatePost}
        onWelcomeClick={handleWelcomeClick}
        onProfileClick={handleProfileClick}
      />
      {currentView !== "welcome" && (
      <NavBar
        communities={communities}
        onCommunityClick={handleCommunityClick}
        onHomeClick={handleHomeClick}
        onCreateCommunity={handleCreateCommunity}
        setCurrentView={setCurrentView}
      />
      )}
      <main>{renderView()}</main>
    </div>
  );
};

export default Phreddit;
