import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const HomePage = ({ onPostClick }) => {
  const [joinedPosts, setJoinedPosts] = useState([]);
  const [otherPosts, setOtherPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedPosts, fetchedCommunities, fetchedLinkFlairs] =
          await Promise.all([
            api.getAllPosts(),
            api.getAllCommunities(),
            api.getAllLinkFlairs(),
          ]);

        setCommunities(fetchedCommunities);
        setLinkFlairs(fetchedLinkFlairs);

        // Separate posts into joined and other communities
        const userJoinedCommunities = user
          ? fetchedCommunities.filter((community) =>
              community.members.includes(user.displayName)
            )
          : [];
        const joinedCommunityIDs = userJoinedCommunities.map((c) => c._id);

        const joinedPosts = fetchedPosts.filter((post) =>
          joinedCommunityIDs.some((communityId) =>
            fetchedCommunities
              .find((community) => community._id === communityId)
              .postIDs.includes(post._id)
          )
        );
        const otherPosts = fetchedPosts.filter(
          (post) =>
            !joinedCommunityIDs.some((communityId) =>
              fetchedCommunities
                .find((community) => community._id === communityId)
                .postIDs.includes(post._id)
            )
        );

        setJoinedPosts(joinedPosts);
        setOtherPosts(otherPosts);

        // Fetch comment counts and latest comment dates for each post
        const counts = await Promise.all(
          fetchedPosts.map(async (post) => {
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
          const aLastCommentDate = commentCounts.find((c) => c.postId === a._id)?.latestCommentDate || a.postedDate;
          const bLastCommentDate = commentCounts.find((c) => c.postId === b._id)?.latestCommentDate || b.postedDate;

          return new Date(bLastCommentDate) - new Date(aLastCommentDate);
        });
      default:
        return postsCopy;
    }
  };

  const sortedJoinedPosts = sortPosts(joinedPosts);
  const sortedOtherPosts = sortPosts(otherPosts);

  const getCommentCount = (postId) => {
    const countObj = commentCounts.find((count) => count.postId === postId);
    return countObj ? countObj.count : 0;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div id="home-page">
      <div className="header-container">
        {user ? <h1 className="header-title"> </h1>: <h1 className="header-title">All Posts</h1>}
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

      {/* Conditionally render posts based on whether the user is logged in */}
      {user ? (
        <div id="joined-posts-container">
          <h2>Posts from Communities You've Joined</h2>
          {sortedJoinedPosts.map((post) => {
            const community = communities.find((c) =>
              c.postIDs.includes(post._id)
            );
            const linkFlair =
              post.linkFlairID && post.linkFlairID.length > 0
                ? linkFlairs.find((f) => f._id === post.linkFlairID[0]._id)
                : null;

            const totalComments = getCommentCount(post._id);

            return (
              <div className="post" key={post._id}>
                <div className="post-header">
                  {community ? community.name : "Unknown Community"} |{" "}
                  {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}{" "}
                </div>
                <div className="post-title" onClick={() => onPostClick(post._id)}>
                  {post.title}
                </div>
                {linkFlair && (
                  <div className="post-flair">{linkFlair.content}</div>
                )}
                <div className="post-content">
                  {post.content.length > 80
                    ? post.content.substring(0, 80) + "..."
                    : post.content}
                </div>
                <div className="post-stats">
                  {post.upvotes} upvotes | {post.views} views | {totalComments} comments
                </div>
                <hr className="divider" />
              </div>
            );
          })}
        </div>
      ) : null}

      <div id="other-posts-container">
        {!user ? null : <h2>Other Communities</h2>}
        {sortedOtherPosts.map((post) => {
          const community = communities.find((c) =>
            c.postIDs.includes(post._id)
          );
          const linkFlair =
            post.linkFlairID && post.linkFlairID.length > 0
              ? linkFlairs.find((f) => f._id === post.linkFlairID[0]._id)
              : null;

          const totalComments = getCommentCount(post._id);

          return (
            <div className="post" key={post._id}>
              <div className="post-header">
                {community ? community.name : "Unknown Community"} |{" "}
                {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}{" "}
              </div>
              <div className="post-title" onClick={() => onPostClick(post._id)}>
                {post.title}
              </div>
              {linkFlair && (
                <div className="post-flair">{linkFlair.content}</div>
              )}
              <div className="post-content">
                {post.content.length > 80
                  ? post.content.substring(0, 80) + "..."
                  : post.content}
              </div>
              <div className="post-stats">
                {post.upvotes} upvotes | {post.views} views | {totalComments} comments
              </div>
              <hr className="divider" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
