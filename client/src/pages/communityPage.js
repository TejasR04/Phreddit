import React, { useEffect, useState } from "react";
import { formatTimestamp } from "../utils/utils";
import { api } from "../services/api";
import { useUser } from "../utils/userContext";

const CommunityPage = ({ communityName, onPostClick }) => {
  const { user } = useUser();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [lastCommentDates, setLastCommentDates] = useState([]);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        const fetchedCommunity = await api.getAllCommunities();
        const selectedCommunity = fetchedCommunity.find(
          (c) => c.name === communityName
        );
        setCommunity(selectedCommunity);

        if (user && selectedCommunity) {
          setIsMember(
            selectedCommunity.members.some(
              (member) => member === user.displayName
            )
          );
        }        

        if (selectedCommunity) {
          const fetchedPosts = await api.getAllPosts();
          const communityPosts = fetchedPosts.filter((post) =>
            selectedCommunity.postIDs.includes(post._id)
          );
          setPosts(communityPosts);

          const countsAndDates = await Promise.all(
            communityPosts.map(async (post) => {
              const comments = await api.getComments(post._id);

              const countNestedComments = (comments) => {
                let count = comments.length;
                comments.forEach((comment) => {
                  if (Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0) {
                    count += countNestedComments(comment.commentIDs);
                  }
                });
                return count;
              };

              const findLastCommentDate = (comments) => {
                let lastDate = new Date(post.postedDate);
                comments.forEach((comment) => {
                  const commentDate = new Date(comment.commentedDate);
                  if (commentDate > lastDate) lastDate = commentDate;
                  if (Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0) {
                    const nestedDate = findLastCommentDate(comment.commentIDs);
                    if (nestedDate > lastDate) lastDate = nestedDate;
                  }
                });
                return lastDate;
              };

              const totalCount = countNestedComments(comments);
              const lastDate = findLastCommentDate(comments);

              return { postId: post._id, count: totalCount, lastCommentDate: lastDate };
            })
          );

          setCommentCounts(countsAndDates.map(({ postId, count }) => ({ postId, count })));
          setLastCommentDates(countsAndDates.map(({ postId, lastCommentDate }) => ({ postId, lastCommentDate })));

          const fetchedFlairs = await api.getAllLinkFlairs();
          setLinkFlairs(fetchedFlairs);
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityData();
  }, [communityName]);

  const handleCommunityMembership = async () => {
    if (!user) return;

    try {
      if (isMember) {
        await api.leaveCommunity(community._id, user.displayName);
        setIsMember(false);
        setCommunity((prevCommunity) => ({
          ...prevCommunity,
          members: prevCommunity.members.filter(
            (member) => member !== user.displayName
          ),
        }));
      } else {
        await api.joinCommunity(community._id, user.displayName);
        setIsMember(true);
        setCommunity((prevCommunity) => ({
          ...prevCommunity,
          members: [...prevCommunity.members, user.displayName],
        }));
      }
    } catch (error) {
      console.error("Error updating community membership:", error);
    }
  };

  const sortedPosts = () => {
    if (!posts || posts.length === 0) return [];

    switch (sortOrder) {
      case "newest":
        return [...posts].sort(
          (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
        );
      case "oldest":
        return [...posts].sort(
          (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
        );
      case "active":
        return [...posts].sort((a, b) => {
          const aLastCommentDate =
            lastCommentDates.find((c) => c.postId === a._id)?.lastCommentDate ||
            new Date(a.postedDate);
          const bLastCommentDate =
            lastCommentDates.find((c) => c.postId === b._id)?.lastCommentDate ||
            new Date(b.postedDate);

          return new Date(bLastCommentDate) - new Date(aLastCommentDate);
        });
      default:
        return posts;
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!community) {
    return <div>Community not found.</div>;
  }

  return (
    <div id="community-page">
      <div id="community-header">
        <div id="community-header-top">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 id="community-name">{community.name}</h1>
            {user && (
              <button
                onClick={handleCommunityMembership}
                className={isMember ? "leave-btn" : "join-btn"}
                style={{
                  backgroundColor: isMember ? "red" : "green",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {isMember ? "Leave Community" : "Join Community"}
              </button>
            )}
          </div>
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
        <p id="community-description">{community.description}</p>
        <p id="community-age">
          Created: {community.creator} | {" "} {new Date(community.startDate).toLocaleDateString()}
        </p>
        <p>
          {posts.length} posts | {community.members.length} members
        </p>
        <hr className="divider" />
      </div>

      <div id="community-posts-container">
        {sortedPosts().map((post) => {
          const linkFlair =
            post.linkFlairID && post.linkFlairID.length > 0
              ? linkFlairs.find((f) => f._id === post.linkFlairID[0]._id)
              : null;
          const totalComments =
            commentCounts.find((c) => c.postId === post._id)?.count || 0;
          return (
            <div className="community-post" key={post._id}>
              <div className="community-post-header">
                {post.postedBy} | {formatTimestamp(new Date(post.postedDate))}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityPage;
