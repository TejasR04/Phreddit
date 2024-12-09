import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const NewPostPage = ({ setCurrentView, isEdit, editData }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityID, setCommunityID] = useState("");
  const [linkFlair, setLinkFlair] = useState("");
  const [newLinkFlair, setNewLinkFlair] = useState("");
  const [communities, setCommunities] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [error, setError] = useState("");
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allCommunities = await api.getAllCommunities();
        const sortedCommunities = allCommunities.sort((a, b) => {
          const userJoinedA = a.members.includes(user.displayName);
          const userJoinedB = b.members.includes(user.displayName);
          if (userJoinedA && !userJoinedB) return -1;
          if (!userJoinedA && userJoinedB) return 1;
          return 0;
        });
        setCommunities(sortedCommunities);

        const fetchedFlairs = await api.getAllLinkFlairs(); // Correct API call for link flairs
        setLinkFlairs(fetchedFlairs);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (isEdit && editData) {
      setTitle(editData.title); 
      setContent(editData.content);
      setCommunityID(editData.communityId);
      setLinkFlair(editData.linkFlairID[0]);
    }
    fetchData();
  }, [isEdit, editData]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.deletePost(editData._id);
        setCurrentView({ view: "profile" });
      } catch (err) {}
    }
  };

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

    try {
      let linkFlairID = linkFlair;
      if (newLinkFlair && !linkFlair) {
        const newFlair = await api.createLinkFlair({ content: newLinkFlair });
        linkFlairID = newFlair._id;
      }

      const newPost = {
        title,
        content,
        postedBy: user.displayName,
        communityId: communityID,
        linkFlairID: linkFlairID ? [linkFlairID] : [],
      };

      if (isEdit) {
        await api.updatePost(editData._id, newPost);
      } else {
        await api.createPost(newPost);
      }

      setTitle("");
      setContent("");
      setCommunityID("");
      setLinkFlair("");
      setNewLinkFlair("");

      setCurrentView("home");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create the post. Please try again.");
    }
  };

  if (!user) {
    return <div>You must be logged in to create a post.</div>;
  }

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
          <label htmlFor="title">
            Post Title (Required, Max 100 characters)
          </label>
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
          <label htmlFor="creator">Creator </label>
          <input type="text" value={user.displayName} disabled />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit">Submit Post</button>
        {isEdit && (
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        )}
      </form>
    </div>
  );
};

export default NewPostPage;
