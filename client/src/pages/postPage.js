import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";
import { set } from "mongoose";

const PostPage = ({ postID, handleReplyClick }) => {
  const [currentView, setCurrentView] = useState(null);
  const [post, setPost] = useState(null);
  const [community, setCommunity] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCommentCount, setTotalCommentCount] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError(null);

        const postDetails = await api.getPost(postID);
        setPost(postDetails);

        const allCommunities = await api.getAllCommunities();
        const associatedCommunity = allCommunities.find((community) =>
          community.postIDs.some((id) => id.toString() === postID)
        );

        if (associatedCommunity) {
          setCommunity(associatedCommunity);
        }

        const postComments = await api.getComments(postID);
        setComments(postComments);

        const countComments = (comments) => {
          return comments.reduce((count, comment) => {
            if (Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0) {
              return count + 1 + countComments(comment.commentIDs);
            }
            return count + 1;
          }, 0);
        };

        setTotalCommentCount(countComments(postComments));
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError("Failed to load post details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postID]);

  const handleUpvotePost = async () => {
    if (!user || user.reputation < 50) return;
    try {
      await api.upvotePost(postID, user.displayName);
      // Re-fetch post data to update the UI
      const updatedPost = await api.getPost(postID);
      setPost(updatedPost);
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };
  
  const handleDownvotePost = async () => {
    if (!user || user.reputation < 50) return;
    try {
      await api.downvotePost(postID, user.displayName);
      // Re-fetch post data to update the UI
      const updatedPost = await api.getPost(postID);
      setPost(updatedPost);
    } catch (error) {
      console.error("Error downvoting post:", error);
    }
  };
  
  const handleUpvoteComment = async (commentID) => {
    if (!user || user.reputation < 50) return;
    try {
      await api.upvoteComment(commentID, user.displayName);
      // Re-fetch comments to update the UI
      const updatedComments = await api.getComments(postID);
      setComments(updatedComments);
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };
  
  const handleDownvoteComment = async (commentID) => {
    if (!user || user.reputation < 50) return;
    try {
      await api.downvoteComment(commentID, user.displayName);
      // Re-fetch comments to update the UI
      const updatedComments = await api.getComments(postID);
      setComments(updatedComments);
    } catch (error) {
      console.error("Error downvoting comment:", error);
    }
  };
  
  const renderComments = (comments, indentLevel = 0) => {
    return comments.map((comment) => (
      <div
        key={comment._id}
        style={{ marginLeft: `${indentLevel * 20}px`, marginTop: "10px" }}
        className="comment"
      >
        <div className="comment-header">
          {comment.commentedBy} | {formatTimestamp(new Date(comment.commentedDate))}
        </div>
        <div className="comment-content">{comment.content}</div>
        <div className="comment-stats">
          <span>{comment.upvotes} upvotes</span>
          {user ? (
            <div className="comment-vote-buttons">
              <button
                className={`vote-btn upvote ${user.reputation < 50 ? "disabled" : ""}`}
                onClick={() => handleUpvoteComment(comment._id)}
                disabled={user.reputation < 50}
              >
                Upvote
              </button>
              <button
              className={`vote-btn downvote ${user.reputation < 50 ? "disabled" : ""}`}
              onClick={() => handleDownvoteComment(comment._id)}
              disabled={user.reputation < 50}
            >
              Downvote
            </button>
            </div>
          ) : (
            <div className="comment-vote-buttons">
              <button className="vote-btn upvote disabled" disabled>
                Upvote
              </button>
              <button className="vote-btn downvote disabled" disabled>
                Downvote
              </button>
            </div>
          )}
        </div>
        {user && (
          <button
            className="reply-btn"
            onClick={() => handleReplyClick(comment._id)}
          >
            Reply
          </button>
        )}
        {Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0 &&
          renderComments(comment.commentIDs, indentLevel + 1)}
      </div>
    ));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <div id="post-page">
      <div className="post-header">
        <div className="post-meta">
          <span className="community-name">
            {community ? community.name : "Unknown Community"}
          </span>
          <span className="separator"> | </span>
          <span className="post-date">{formatTimestamp(new Date(post.postedDate))}</span>
        </div>
        <div className="post-author">{post.postedBy}</div>
        <h1 className="post-view-title">{post.title}</h1>
        {post.linkFlairID && post.linkFlairID.length > 0 && (
          <div className="post-flair">
            {post.linkFlairID.map((flair) => flair.content).join(", ")}
          </div>
        )}
        <div className="post-content">{post.content}</div>
        <div className="post-stats">
          <span>{post.upvotes} upvotes | </span>
          <span>{post.views} views</span>
          <span className="separator"> | </span>
          <span>{totalCommentCount} comments</span>
        </div>
        {user ? (
          <div className="vote-buttons">
            <button
              className={`vote-btn upvote ${user.reputation < 50 ? "disabled" : ""}`}
              onClick={handleUpvotePost}
              disabled={user.reputation < 50}
            >
              Upvote
            </button>
            <button
              className={`vote-btn downvote ${user.reputation < 50 ? "disabled" : ""}`}
              onClick={handleDownvotePost}
              disabled={user.reputation < 50}
            >
              Downvote
            </button>
          </div>
        ) : (
          <div className="vote-buttons">
            <button className="vote-btn upvote disabled" disabled>
              Upvote
            </button>
            <button className="vote-btn downvote disabled" disabled>
              Downvote
            </button>
          </div>
        )}
        {user && (
          <button
            className="add-comment-btn"
            onClick={() => handleReplyClick(null)}
          >
            Add a Comment
          </button>
        )}
        <hr className="divider" />
      </div>

      <div className="comments-section">
        {comments.length > 0
          ? renderComments(comments) 
          : "No comments yet."}
      </div>
    </div>
  );
};

export default PostPage;
