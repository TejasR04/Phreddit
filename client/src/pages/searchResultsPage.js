import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const SearchResultsPage = ({ query, onPostClick }) => {
  const [joinedPosts, setJoinedPosts] = useState([]);
  const [otherPosts, setOtherPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [commentCounts, setCommentCounts] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const [results, flairs, communities] = await Promise.all([
          api.search(query),
          api.getAllLinkFlairs(),
          api.getAllCommunities(),
        ]);

        const userJoinedCommunities = user
          ? communities.filter((community) =>
              community.members.includes(user.displayName)
            )
          : [];

        const joinedCommunityIDs = userJoinedCommunities.map((c) => c._id);

        const joinedPosts = results.filter((post) =>
          joinedCommunityIDs.some((id) =>
            communities.find((community) => community._id === id)?.postIDs.includes(post._id)
          )
        );

        const otherPosts = results.filter(
          (post) =>
            !joinedCommunityIDs.some((id) =>
              communities.find((community) => community._id === id)?.postIDs.includes(post._id)
            )
        );

        setJoinedPosts(joinedPosts);
        setOtherPosts(otherPosts);
        setLinkFlairs(flairs);

        // Fetch nested comment counts for sorting
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
  }, [query, user]);

  const sortPosts = (posts) => {
    if (!posts || posts.length === 0) return [];

    const postsCopy = [...posts];

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
          const aLastCommentDate =
            commentCounts.find((c) => c.postId === a._id)?.latestCommentDate ||
            a.postedDate;
          const bLastCommentDate =
            commentCounts.find((c) => c.postId === b._id)?.latestCommentDate ||
            b.postedDate;

          return new Date(bLastCommentDate) - new Date(aLastCommentDate);
        });
      default:
        return postsCopy;
    }
  };

  const sortedJoinedPosts = sortPosts(joinedPosts);
  const sortedOtherPosts = sortPosts(otherPosts);

  const getLinkFlairForPost = (post) =>
    post.linkFlairID && post.linkFlairID.length > 0
      ? linkFlairs.find((flair) => flair._id === post.linkFlairID[0]._id)
      : null;

  const getCommentCount = (postId) => {
    const countObj = commentCounts.find((count) => count.postId === postId);
    return countObj ? countObj.count : 0;
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div id="search-results-page">
      <div id="search-results-header-section">
        <h1 id="search-results-header">
          {query
            ? `Search Results for: ${query}`
            : `No results found for: ${query}`}
        </h1>
        <div className="sort-buttons">
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

      <div id="search-results-container">
        <div>
          <h2>Your Communities</h2>
          {sortedJoinedPosts.map((post) => (
            <div key={post._id} className="search-result-post">
              <div className="post-header">
                {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}
                <div className="post-community">
                  {post.community?.name || "Unknown Community"}
                </div>
              </div>
              <div className="post-title" onClick={() => onPostClick(post._id)}>
                {post.title}
              </div>
              {getLinkFlairForPost(post) && (
                <div className="post-flair">{getLinkFlairForPost(post).content}</div>
              )}
              <div className="post-content">{post.content}</div>
              <div className="post-stats">
                {post.upvotes} upvotes | {post.views} views |{" "}
                {getCommentCount(post._id)} comments
              </div>
            </div>
          ))}
        </div>
        <hr />
        <div>
          <h2>Other Communities</h2>
          {sortedOtherPosts.map((post) => (
            <div key={post._id} className="search-result-post">
              <div className="post-header">
                {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}
                <div className="post-community">
                  {post.community?.name || "Unknown Community"}
                </div>
              </div>
              <div className="post-title" onClick={() => onPostClick(post._id)}>
                {post.title}
              </div>
              {getLinkFlairForPost(post) && (
                <div className="post-flair">{getLinkFlairForPost(post).content}</div>
              )}
              <div className="post-content">{post.content}</div>
              <div className="post-stats">
                {post.upvotes} upvotes | {post.views} views |{" "}
                {getCommentCount(post._id)} comments
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
