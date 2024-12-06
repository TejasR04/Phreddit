import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";
const NewCommentPage = ({ setCurrentView, postID, parentCommentID }) => {
  const { user } = useUser(); 
  const [username, setUsername] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [errors, setErrors] = useState({ content: "" });
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.displayName);
    }
  }, [user]);

  // Validate input fields
  const validateInputs = () => {
    let isValid = true;
    const newErrors = { content: "" };

    if (!commentContent.trim()) {
      newErrors.content = "Comment content is required.";
      isValid = false;
    } else if (commentContent.length > 500) {
      newErrors.content = "Comment cannot exceed 500 characters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    // Prepare comment data with the logged-in user's displayName
    const commentData = {
      content: commentContent,
      commentedBy: user ? user.displayName : "Guest", 
    };

    if (parentCommentID) {
      commentData.parentCommentId = parentCommentID; 
    }

    try {
      setLoading(true);
      setSubmissionError("");

      await api.createComment(postID, commentData); 

      // Clear input fields and navigate back
      setCommentContent("");
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
        <button type="submit" disabled={loading || !user}>
          {loading ? "Submitting..." : "Submit Comment"}
        </button>
        {submissionError && <div className="error">{submissionError}</div>}
      </form>
      {!user && <div className="error">You must be logged in to comment.</div>}
    </div>
  );
};

export default NewCommentPage;
