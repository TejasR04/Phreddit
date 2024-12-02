import React, { useState } from "react";
import { api } from "../services/api";

const NewCommentPage = ({ setCurrentView, postID, parentCommentID }) => {
  const [commentContent, setCommentContent] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({ content: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // Validate input fields
  const validateInputs = () => {
    let isValid = true;
    const newErrors = { content: "", username: "" };

    if (!commentContent.trim()) {
      newErrors.content = "Comment content is required.";
      isValid = false;
    } else if (commentContent.length > 500) {
      newErrors.content = "Comment cannot exceed 500 characters.";
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle comment submission
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateInputs()) return;

  // Prepare comment data
  const commentData = {
    content: commentContent,
    commentedBy: username,
  };

  if (parentCommentID) {
    commentData.parentCommentId = parentCommentID; // Include parentCommentId for replies
  }

  try {
    setLoading(true);
    setSubmissionError("");

    // Submit comment to the server
    await api.createComment(postID, commentData); // Always use postID for the API endpoint

    // Clear input fields and navigate back
    setCommentContent("");
    setUsername("");
    setCurrentView("post");
  } catch (error) {
    console.error("Error submitting comment:", error);
    setSubmissionError("Failed to submit the comment. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div id="new-comment-page">
      <h2>Add a Comment</h2>
      <form id="new-comment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username (required)</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="comment">
            Comment Content (required, max 500 characters)
          </label>
          <textarea
            id="comment"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            maxLength={500}
          />
          {errors.content && <div className="error">{errors.content}</div>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Comment"}
        </button>
        {submissionError && <div className="error">{submissionError}</div>}
      </form>
    </div>
  );
};

export default NewCommentPage;
