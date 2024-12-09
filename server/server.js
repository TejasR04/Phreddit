const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Community = require("./models/communities");
const Post = require("./models/posts");
const Comment = require("./models/comments");
const LinkFlair = require("./models/linkflairs");
const User = require("./models/users");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/phreddit")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/communities", async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/register", async (req, res) => {
    const { firstName, lastName, email, displayName, password, passwordVerification } = req.body;
  
    if (password !== passwordVerification) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  
    try {
      const existingUser = await User.findOne({ $or: [{ email }, { displayName }] });
      if (existingUser) {
        return res.status(400).json({ message: "Email or Display Name already exists" });
      }
      console.log('Password', password);
  
      const newUser = new User({
        firstName,
        lastName,
        email,
        displayName,
        password,
        reputation: 100,
      });
  
      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Entered email:', user.email);
      console.log('Entered password:', password);
      console.log('Hashed password from DB:', user.password);
      console.log('Passwords match:', isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
  
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password; 
  
      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword, 
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  


app.post("/communities", async (req, res) => {
  const community = new Community({
    name: req.body.name,
    description: req.body.description,
    members: req.body.members || [],
    creator: req.body.creator,
  });
  
  try {
    const newCommunity = await community.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/users/:userId/communities", async (req, res) => {
  try {
    const userId = req.params.userId;
    const communities = await Community.find({ members: userId });
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/communities/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate(
      "postIDs"
    );
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("linkFlairID");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/posts", async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    postedBy: req.body.postedBy,
    linkFlairID: req.body.linkFlairID,
  });

  try {
    const newPost = await post.save();
    if (req.body.communityId) {
      await Community.findByIdAndUpdate(req.body.communityId, {
        $push: { postIDs: newPost._id },
      });
    }
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("linkFlairID")
      .populate("commentIDs")
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.patch("/posts/:id/views", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const populateNestedComments = {
      path: "commentIDs",
      populate: {
        path: "commentIDs",
        populate: {
          path: "commentIDs",
          populate: {
            path: "commentIDs",
            populate: {
              path: "commentIDs",
              populate: {
                path: "commentIDs",
                populate: {
                  path: "commentIDs",
                  populate: {
                    path: "commentIDs",
                  },
                },
              }, 
            },
          },
        },
      },
    };

    const post = await Post.findById(req.params.postId).populate(populateNestedComments);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const buildNestedComments = (comments) => {
      return comments
        .sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate)) 
        .map((comment) => {
          return {
            _id: comment._id,
            content: comment.content,
            commentedBy: comment.commentedBy,
            commentedDate: comment.commentedDate,
            commentIDs: buildNestedComments(comment.commentIDs || []), 
            upvotes: comment.upvotes,
          };
        });
    };

    const nestedComments = buildNestedComments(post.commentIDs || []);
    //console.log("Nested Comments: ",nestedComments);

    res.json(nestedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



app.post("/posts/:postId/comments", async (req, res) => {
  const { content, commentedBy, parentCommentId, displayName } = req.body;
  const comment = new Comment({
    content,
    commentedBy,
    commentIDs: [],
  });

  try {
    const newComment = await comment.save();

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { commentIDs: newComment._id },
      });
    } else {
      await Post.findByIdAndUpdate(req.params.postId, {
        $push: { commentIDs: newComment._id },
      });
    }

    // Update the user's commentIDs array
    if (displayName) {
      const user = await User.findOne({ displayName });
      if (user) {
        user.commentIDs.push(newComment._id);
        await user.save();
      }
    }

    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: "Error creating comment", error: err });
  }
});


app.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
      .populate("linkFlairID")
      .populate({
        path: "commentIDs",
        select: "text",
      });

    const communityIds = await Community.find({
      postIDs: { $in: posts.map((post) => post._id) },
    });

    const postToCommunityMap = {};
    communityIds.forEach((community) => {
      community.postIDs.forEach((postId) => {
        postToCommunityMap[postId] = {
          name: community.name,
          description: community.description,
          id: community._id,
        };
      });
    });

    const postsWithCommunity = posts.map((post) => ({
      ...post.toObject(), 
      community: postToCommunityMap[post._id] || null,
    }));

    res.json(postsWithCommunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/linkFlairs", async (req, res) => {
  try {
    const linkFlairs = await LinkFlair.find();
    res.json(linkFlairs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post("/linkFlairs", async (req, res) => {
  const linkFlair = new LinkFlair({
    content: req.body.content,
  });

  try {
    const newFlair = await linkFlair.save();
    res.status(201).json(newFlair);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/communities/:communityId/join", async (req, res) => {
  try {
    const { communityId } = req.params;
    const { displayName } = req.body; // Use displayName instead of userId

    const community = await Community.findById(communityId);
    const user = await User.findOne({ displayName }); // Find user by displayName

    if (!community.members.includes(displayName)) { // Check for displayName in members array
      console.log("The user displayName being added is: ", displayName);
      //Display the communitId being added to the user
      community.members.push(displayName); // Add displayName to community's members array
      user.communityIDs.push(communityId); // Add communityId to user's communityIDs array

      await community.save();
      await user.save();
    }

    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ message: "Error joining community", error });
  }
});

app.post("/communities/:communityId/leave", async (req, res) => {
  try {
    const { communityId } = req.params;
    const { displayName } = req.body; // Use displayName instead of userId

    const community = await Community.findById(communityId);
    const user = await User.findOne({ displayName }); // Find user by displayName

    // Remove displayName from community's members array
    community.members = community.members.filter(
      (member) => member !== displayName
    );

    // Remove communityId from user's communityIDs array
    user.communityIDs = user.communityIDs.filter(
      (commId) => commId.toString() !== communityId
    );

    await community.save();
    await user.save();

    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ message: "Error leaving community", error });
  }
});

app.patch("/posts/:postId/upvote", async (req, res) => {
  const { displayName } = req.body; // User's display name passed in the request body
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.upvoteMembers.includes(displayName)) {
      // Case 1: Cancel upvote
      post.upvoteMembers = post.upvoteMembers.filter((member) => member !== displayName);
      post.upvotes -= 1;
    } else if (post.downvoteMembers.includes(displayName)) {
      // Case 2: Switch vote
      post.downvoteMembers = post.downvoteMembers.filter((member) => member !== displayName);
      post.upvoteMembers.push(displayName);
      post.upvotes += 2;
    } else {
      // Case 3: New upvote
      post.upvoteMembers.push(displayName);
      post.upvotes += 1;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error upvoting post", error });
  }
});

app.patch("/comments/:commentId/upvote", async (req, res) => {
  const { displayName } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.upvoteMembers.includes(displayName)) {
      // Case 1: Cancel upvote
      comment.upvoteMembers = comment.upvoteMembers.filter((member) => member !== displayName);
      comment.upvotes -= 1;
    } else if (comment.downvoteMembers.includes(displayName)) {
      // Case 2: Switch vote
      comment.downvoteMembers = comment.downvoteMembers.filter((member) => member !== displayName);
      comment.upvoteMembers.push(displayName);
      comment.upvotes += 2;
    } else {
      // Case 3: New upvote
      comment.upvoteMembers.push(displayName);
      comment.upvotes += 1;
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error upvoting comment", error });
  }
});


app.patch("/posts/:postId/downvote", async (req, res) => {
  const { displayName } = req.body; // User's display name passed in the request body
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.downvoteMembers.includes(displayName)) {
      // Case 1: Cancel downvote
      post.downvoteMembers = post.downvoteMembers.filter((member) => member !== displayName);
      post.upvotes += 1;
    } else if (post.upvoteMembers.includes(displayName)) {
      // Case 2: Switch vote
      post.upvoteMembers = post.upvoteMembers.filter((member) => member !== displayName);
      post.downvoteMembers.push(displayName);
      post.upvotes -= 2;
    } else {
      // Case 3: New downvote
      post.downvoteMembers.push(displayName);
      post.upvotes -= 1;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error downvoting post", error });
  }
});


app.patch("/comments/:commentId/downvote", async (req, res) => {
  const { displayName } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.downvoteMembers.includes(displayName)) {
      // Case 1: Cancel downvote
      comment.downvoteMembers = comment.downvoteMembers.filter((member) => member !== displayName);
      comment.upvotes += 1;
    } else if (comment.upvoteMembers.includes(displayName)) {
      // Case 2: Switch vote
      comment.upvoteMembers = comment.upvoteMembers.filter((member) => member !== displayName);
      comment.downvoteMembers.push(displayName);
      comment.upvotes -= 2;
    } else {
      // Case 3: New downvote
      comment.downvoteMembers.push(displayName);
      comment.upvotes -= 1;
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error downvoting comment", error });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Server closed. Database instance disconnected");
  process.exit(0);
});
