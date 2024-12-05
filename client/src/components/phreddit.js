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
import { api } from "../services/api";

const Phreddit = () => {
  const [currentView, setCurrentView] = useState("welcome");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [parentCommentID, setParentCommentID] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await api.getAllCommunities();
        setCommunities(data);
      } catch (err) {
        setError("Failed to load communities");
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

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
    setCurrentView("newPost");
  };

  const handleHomeClick = () => {
    setCurrentView("home");
  };

  const handleCreateCommunity = () => {
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
          />
        );
      case "newPost":
        return <NewPostPage api={api} setCurrentView={setCurrentView} />;
      case "post":
        return (
          <PostPage
            api={api}
            postID={selectedPost}
            setCurrentView={setCurrentView}
            handleReplyClick={handleReplyClick}
          />
        );
      case "newComment":
        return (
          <NewCommentPage
            api={api}
            setCurrentView={setCurrentView}
            postID={selectedPost}
            parentCommentID={parentCommentID}
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
        onHomeClick={handleHomeClick}
      />
      <NavBar
        communities={communities}
        onCommunityClick={handleCommunityClick}
        onHomeClick={handleHomeClick}
        onCreateCommunity={handleCreateCommunity}
      />
      <main>{renderView()}</main>
    </div>
  );
};

export default Phreddit;
