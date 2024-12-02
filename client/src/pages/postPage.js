import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";

const PostPage = ({ postID, handleReplyClick }) => {
  const [post, setPost] = useState(null);
  const [community, setCommunity] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCommentCount, setTotalCommentCount] = useState(0);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the post details and increment views
        const postDetails = await api.getPost(postID);
        await api.incrementViews(postID);
        setPost(postDetails);

        // Fetch all communities and find the one associated with this post
        const allCommunities = await api.getAllCommunities();
        const associatedCommunity = allCommunities.find((community) =>
          community.postIDs.some((id) => id.toString() === postID)
        );

        if (associatedCommunity) {
          setCommunity(associatedCommunity);
        }

        // Fetch the nested comments for the post
        const postComments = await api.getComments(postID);
        setComments(postComments);
        console.log("Nested Comments: ", postComments);

        // Calculate total comments including replies
        const countComments = (comments) => {
          return comments.reduce((count, comment) => {
            if (Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0) {
              return count + 1 + countComments(comment.commentIDs);
            }
            return count + 1;
          }, 0);
        };

        const totalComments = countComments(postComments);
        setTotalCommentCount(totalComments);
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError("Failed to load post details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postID]);

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
        <button
          className="reply-btn"
          onClick={() => handleReplyClick(comment._id)}
        >
          Reply
        </button>
        {/* Recursively render nested comments */}
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
          <span>{post.views} views</span>
          <span className="separator"> | </span>
          <span>{totalCommentCount} comments</span>
        </div>
        <button
          className="add-comment-btn"
          onClick={() => handleReplyClick(null)}
        >
          Add a Comment
        </button>
        <hr className="divider" />
      </div>

      <div className="comments-section">
        {comments.length > 0
          ? renderComments(comments) // Start rendering from the top-level comments
          : "No comments yet."}
      </div>
    </div>
  );
};

export default PostPage;
