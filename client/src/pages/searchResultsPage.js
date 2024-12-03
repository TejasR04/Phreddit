import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";

const SearchResultsPage = ({ query, onPostClick }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [commentCounts, setCommentCounts] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const [results, flairs] = await Promise.all([
          api.search(query),
          api.getAllLinkFlairs(),
        ]);
        setSearchResults(results);
        setLinkFlairs(flairs);

        // Fetch comment counts and latest comment dates for each post
        const counts = await Promise.all(
          results.map(async (post) => {
            const comments = await api.getComments(post._id);

            const countNestedComments = (comments) => {
              return comments.reduce((count, comment) => {
                if (Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0) {
                  return count + 1 + countNestedComments(comment.commentIDs);
                }
                return count + 1;
              }, 0);
            };

            const findLatestCommentDate = (comments) => {
              return comments.reduce((latest, comment) => {
                const commentDate = new Date(comment.commentedDate);
                if (comment.commentIDs && comment.commentIDs.length > 0) {
                  const nestedLatest = findLatestCommentDate(comment.commentIDs);
                  return new Date(Math.max(latest, nestedLatest));
                }
                return Math.max(latest, commentDate);
              }, new Date(0));
            };

            const totalCount = countNestedComments(comments);
            const latestCommentDate = findLatestCommentDate(comments);

            return { postId: post._id, count: totalCount, latestCommentDate };
          })
        );

        setCommentCounts(counts);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const sortPosts = () => {
    if (!searchResults || searchResults.length === 0) return [];

    const postsCopy = [...searchResults];

    switch (sortOrder) {
      case "newest":
        return postsCopy.sort(
          (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
        );
      case "oldest":
        return postsCopy.sort(
          (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
        );
      case "active":
        return postsCopy.sort((a, b) => {
          const aLastCommentDate = commentCounts.find((c) => c.postId === a._id)?.latestCommentDate || a.postedDate;
          const bLastCommentDate = commentCounts.find((c) => c.postId === b._id)?.latestCommentDate || b.postedDate;

          return new Date(bLastCommentDate) - new Date(aLastCommentDate);
        });
      default:
        return postsCopy;
    }
  };

  const getLinkFlairForPost = (post) =>
    post.linkFlairID && post.linkFlairID.length > 0
      ? linkFlairs.find((flair) => flair._id === post.linkFlairID[0]._id)
      : null;

  const getCommentCount = (postId) => {
    const countObj = commentCounts.find((count) => count.postId === postId);
    return countObj ? countObj.count : 0;
  };

  const displayPosts = sortPosts();

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div id="search-results-page">
      <div id="search-results-header-section">
        <div id="search-results-header-top">
          <h1 id="search-results-header">
            {displayPosts.length > 0
              ? `Results for: ${query}`
              : `No results found for: ${query}`}
          </h1>
          <div id="search-sort-section" className="sort-buttons">
            <button
              className={sortOrder === "newest" ? "active" : ""}
              onClick={() => setSortOrder("newest")}
            >
              Newest
            </button>
            <button
              className={sortOrder === "oldest" ? "active" : ""}
              onClick={() => setSortOrder("oldest")}
            >
              Oldest
            </button>
            <button
              className={sortOrder === "active" ? "active" : ""}
              onClick={() => setSortOrder("active")}
            >
              Active
            </button>
          </div>
        </div>
        <div id="search-results-count">{displayPosts.length} results found</div>
        <div className="divider"></div>
      </div>
      <div id="search-results-container">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <div className="search-result-post" key={post._id}>
              <div className="post-header">
                {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}
              </div>
              <div className="post-title" onClick={() => onPostClick(post._id)}>
                {post.title}
              </div>
              {getLinkFlairForPost(post) && (
                <div className="post-flair">
                  {getLinkFlairForPost(post).content}
                </div>
              )}
              <div className="post-content">
                {post.content.length > 80
                  ? post.content.substring(0, 80) + "..."
                  : post.content}
              </div>
              <div className="post-stats">
                {post.upvotes} upvotes | {post.views} views | {getCommentCount(post._id)} comments
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <img src={"../image/oops.svg"} alt="No results" />
            <p>Things went wrong or no posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
