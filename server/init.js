const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import models
const UserModel = require("./models/users");
const CommunityModel = require("./models/communities");
const PostModel = require("./models/posts");
const CommentModel = require("./models/comments");
const LinkFlairModel = require("./models/linkflairs");

// Check MongoDB URL argument
let userArgs = process.argv.slice(2);

if (userArgs.length < 4) {
  console.log(
    "ERROR: You need to specify 4 arguments in this order: " +
      "1. MongoDB URL, 2. Admin Email, 3. Admin Display Name, 4. Admin Password"
  );
  process.exit(1);
}

if (!userArgs[0] || !userArgs[0].startsWith("mongodb")) {
  console.log("ERROR: First argument must be a valid mongodb URL");
  process.exit(1);
}

let mongoDB = userArgs[0];
const adminEmail = userArgs[1];
const adminDisplayName = userArgs[2];
const adminPassword = userArgs[3];

mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Helper function to create users
async function createUser(userObj) {
  const newUserDoc = new UserModel({
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    password: userObj.password,
    displayName: userObj.displayName,
    reputation: userObj.reputation || 100,
  });
  return newUserDoc.save();
}

// Helper function to create link flairs
async function createLinkFlair(linkFlairObj) {
  const newLinkFlairDoc = new LinkFlairModel({
    content: linkFlairObj.content,
  });
  return newLinkFlairDoc.save();
}

// Helper function to create comments
async function createComment(commentObj) {
  const newCommentDoc = new CommentModel({
    content: commentObj.content,
    commentedBy: commentObj.commentedBy,
    commentedDate: commentObj.commentedDate || new Date(),
    upvotes: commentObj.upvotes || 0,
    commentIDs: commentObj.commentIDs || [],
  });
  return newCommentDoc.save();
}

// Helper function to create posts
async function createPost(postObj) {
  const newPostDoc = new PostModel({
    title: postObj.title,
    content: postObj.content,
    postedBy: postObj.postedBy,
    postedDate: postObj.postedDate || new Date(),
    views: postObj.views || 0,
    upvotes: postObj.upvotes || 0,
    linkFlairID: postObj.linkFlairID || [],
    commentIDs: postObj.commentIDs || [],
  });
  return newPostDoc.save();
}

// Helper function to create communities
async function createCommunity(communityObj) {
  const newCommunityDoc = new CommunityModel({
    name: communityObj.name,
    description: communityObj.description,
    startDate: communityObj.startDate || new Date(),
    members: communityObj.members || [],
    creator: communityObj.creator,
    postIDs: communityObj.postIDs || [],
  });
  return newCommunityDoc.save();
}

// Main initialization function
async function initializeDB() {
  try {
    // Create Admin User
    const adminUser = await createUser({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: adminPassword,
      displayName: adminDisplayName,
      reputation: 1000,
    });
    // Create Users
    const user1 = await createUser({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "securePassword123",
      displayName: "JohnnyD",
      reputation: 150,
    });

    const user2 = await createUser({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      password: "anotherSecurePass456",
      displayName: "JaneS",
      reputation: 120,
    });

    // Create Link Flairs
    const linkFlair1 = await createLinkFlair({
      content: "Discussion",
    });

    const linkFlair2 = await createLinkFlair({
      content: "Humor",
    });

    // Create Comments
    const comment1 = await createComment({
      content: "Great post! Really enjoyed reading this.",
      commentedBy: user1.displayName,
      upvotes: 5,
    });

    const comment2 = await createComment({
      content: "Interesting perspective, thanks for sharing.",
      commentedBy: user2.displayName,
      upvotes: 3,
    });

    // Create Posts
    const post1 = await createPost({
      title: "My First Community Post",
      content: "Hello everyone, this is my first post in the community!",
      postedBy: user1.displayName,
      views: 100,
      upvotes: 10,
      linkFlairID: [linkFlair1._id],
      commentIDs: [comment1._id],
    });

    const post2 = await createPost({
      title: "Thoughts on Our Community",
      content: "I wanted to share some reflections on our amazing community.",
      postedBy: user2.displayName,
      views: 75,
      upvotes: 8,
      linkFlairID: [linkFlair2._id],
      commentIDs: [comment2._id],
    });

    // Create Communities
    const community1 = await createCommunity({
      name: "Tech Enthusiasts",
      description: "A community for technology lovers and innovators",
      members: [user1.displayName, user2.displayName],
      creator: user1.displayName,
      postIDs: [post1._id, post2._id],
    });

    const community2 = await createCommunity({
      name: "Book Lovers",
      description: "Share and discuss your favorite books",
      members: [user2.displayName],
      creator: user2.displayName,
    });

    // Update user documents with their created content
    await UserModel.findByIdAndUpdate(user1._id, {
      $push: {
        postIDs: post1._id,
        commentIDs: comment1._id,
        communityIDs: community1._id,
      },
    });

    await UserModel.findByIdAndUpdate(user2._id, {
      $push: {
        postIDs: post2._id,
        commentIDs: comment2._id,
        communityIDs: [community1._id, community2._id],
      },
    });

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

// Run the initialization
initializeDB().catch((err) => {
  console.error("Unexpected error:", err);
  if (db) {
    db.close();
  }
});
