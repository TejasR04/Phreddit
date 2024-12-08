import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const SearchResultsPage = ({ query, onPostClick }) => {
  const [otherPosts, setOtherPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [commentCounts, setCommentCounts] = useState([]);
  const { user } = useUser();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUserCommunities = user
          ? await api.getUserCommunities(user._id)
          : [];
        const [results, flairs] = await Promise.all([
          api.search(query),
          api.getAllLinkFlairs(),
        ]);
        
        const sortedResults = 
          user && fetchedUserCommunities.length > 0
            ? results.sort((a, b) => {
                const aCommunity = fetchedUserCommunities.find(
                  (comm) => comm._id === a.community?.id
                );
                const bCommunity = fetchedUserCommunities.find(
                  (comm) => comm._id === b.community?.id
                );

                const userJoinedA = 
                  aCommunity && aCommunity.members.includes(user._id);
                const userJoinedB = 
                  bCommunity && bCommunity.members.includes(user._id);

                if (userJoinedA && !userJoinedB) return -1;
                if (!userJoinedA && userJoinedB) return 1;
                return 0;
              })
            : results;

        const userPosts = sortedResults.filter(post => 
          fetchedUserCommunities.some(comm => comm._id === post.community?.id)
        );
        const otherPosts = sortedResults.filter(post => 
          !fetchedUserCommunities.some(comm => comm._id === post.community?.id)
        );
        setUserPosts(userPosts);
        setOtherPosts(otherPosts);
        setLinkFlairs(flairs);

        const counts = await Promise.all(
          sortedResults.map(async (post) => {
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

  const getLinkFlairForPost = (post) =>
    post.linkFlairID && post.linkFlairID.length > 0
      ? linkFlairs.find((flair) => flair._id === post.linkFlairID[0]._id)
      : null;

  const getCommentCount = (postId) => {
    const countObj = commentCounts.find((count) => count.postId === postId);
    return countObj ? countObj.count : 0;
  };

  const displayPosts = sortPosts(userPosts + otherPosts);
  const sortedUserPosts = sortPosts(userPosts);
  const sortedOtherPosts = sortPosts(otherPosts);

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
          <>
            {sortedUserPosts.length > 0 && (
              <>
                <div className="section-header">Your Communities</div>
                {sortedUserPosts.map((post) => (
                  <div key={post._id} className="search-result-post">
                    <div className="post-header">
                      {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}
                      <div className="post-community">
                        {post.community?.name}
                      </div>
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
                      {post.upvotes} upvotes | {post.views} views |{" "}
                      {getCommentCount(post._id)} comments
                    </div>
                  </div>
                ))}
              </>
            )}
            {sortedOtherPosts.length > 0 && (
              <>
                <div className="section-divider"></div>
                <div className="section-header">Other Communities</div>
                {sortedOtherPosts.map((post) => (
                  <div key={post._id} className="search-result-post">
                     <div className="post-header">
                      {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}
                      <div className="post-community">
                        {post.community?.name}
                      </div>
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
                      {post.upvotes} upvotes | {post.views} views |{" "}
                      {getCommentCount(post._id)} comments
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
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
