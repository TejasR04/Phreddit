import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const NewPostPage = ({ setCurrentView }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [communityID, setCommunityID] = useState("");
  const [linkFlair, setLinkFlair] = useState("");
  const [newLinkFlair, setNewLinkFlair] = useState("");
  const [communities, setCommunities] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCommunities = await api.getAllCommunities();
        setCommunities(fetchedCommunities);

        const fetchedFlairs = await api.getAllLinkFlairs(); // Correct API call for link flairs
        setLinkFlairs(fetchedFlairs);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!communityID) {
      setError("Community is required.");
      return;
    }

    if (!title.trim() || title.length > 100) {
      setError("Title is required and must be 100 characters or less.");
      return;
    }

    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    try {
      // Add new link flair if provided and not already existing
      let linkFlairID = linkFlair;
      if (newLinkFlair && !linkFlair) {
        const newFlair = await api.createLinkFlair({ content: newLinkFlair });
        linkFlairID = newFlair._id;
      }

      // Create the new post
      const newPost = {
        title,
        content,
        postedBy: username,
        communityId: communityID,
        linkFlairID: linkFlairID ? [linkFlairID] : [],
      };

      await api.createPost(newPost);

      // Clear form fields after submission
      setTitle("");
      setContent("");
      setUsername("");
      setCommunityID("");
      setLinkFlair("");
      setNewLinkFlair("");

      // Redirect to the Home Page
      setCurrentView("home");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create the post. Please try again.");
    }
  };

  return (
    <div id="new-post-page">
      <h1>Create a New Post</h1>
      <form id="new-post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="communityID">Select Community (Required)</label>
          <select
            id="communityID"
            value={communityID}
            onChange={(e) => setCommunityID(e.target.value)}
          >
            <option value="">-- Select Community --</option>
            {communities.map((community) => (
              <option key={community._id} value={community._id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Post Title (Required, Max 100 characters)</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength="100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkFlair">Link Flair (Optional)</label>
          <select
            id="linkFlair"
            value={linkFlair}
            onChange={(e) => {
              setLinkFlair(e.target.value);
              setNewLinkFlair("");
            }}
          >
            <option value="">-- Select Link Flair --</option>
            {linkFlairs.map((flair) => (
              <option key={flair._id} value={flair._id}>
                {flair.content}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or enter a new link flair (Max 30 characters)"
            maxLength="30"
            value={newLinkFlair}
            onChange={(e) => setNewLinkFlair(e.target.value)}
            disabled={linkFlair !== ""}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Post Content (Required)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username (Required)</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit">Submit Post</button>
      </form>
    </div>
  );
};

export default NewPostPage;
