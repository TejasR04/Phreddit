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

// User Registration
app.post("/register", async (req, res) => {
    const { firstName, lastName, email, displayName, password, passwordVerification } = req.body;
  
    // Check if passwords match
    if (password !== passwordVerification) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  
    try {
      // Check if the email or display name already exists
      const existingUser = await User.findOne({ $or: [{ email }, { displayName }] });
      if (existingUser) {
        return res.status(400).json({ message: "Email or Display Name already exists" });
      }
      console.log('Password', password);
  
      // Create new user
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
  
  // User Login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Entered email:', user.email);
      console.log('Entered password:', password);
      console.log('Hashed password from DB:', user.password);
      console.log('Passwords match:', isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
  
      // Return the full user object, excluding sensitive fields like password
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password; // Don't send the password to the client
  
      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword, // Send the full user object
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
  });

  try {
    const newCommunity = await community.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    // Update community's postIDs
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

    // Fetch the post with populated comments
    const post = await Post.findById(req.params.postId).populate(populateNestedComments);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Recursive function to build and sort the nested comment structure
    const buildNestedComments = (comments) => {
      return comments
        .sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate)) // Sort by newest first
        .map((comment) => {
          return {
            _id: comment._id,
            content: comment.content,
            commentedBy: comment.commentedBy,
            commentedDate: comment.commentedDate,
            commentIDs: buildNestedComments(comment.commentIDs || []), // Recursively process child comments
          };
        });
    };

    // Process all top-level comments of the post
    const nestedComments = buildNestedComments(post.commentIDs || []);
    console.log("Nested Comments: ",nestedComments);

    res.json(nestedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



app.post("/posts/:postId/comments", async (req, res) => {
  const comment = new Comment({
    content: req.body.content,
    commentedBy: req.body.commentedBy,
    commentIDs: [],
  });

  try {
    const newComment = await comment.save();
    // Update post or parent comment
    if (req.body.parentCommentId) {
      await Comment.findByIdAndUpdate(req.body.parentCommentId, {
        $push: { commentIDs: newComment._id },
      });
    } else {
      await Post.findByIdAndUpdate(req.params.postId, {
        $push: { commentIDs: newComment._id },
      });
    }
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    }).populate("linkFlairID");
    res.json(posts);
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
    const { userId } = req.body;

    const community = await Community.findById(communityId);
    const user = await User.findById(userId);

    if (!community.members.includes(userId)) {
      community.members.push(userId);
      user.communityIDs.push(communityId);

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
    const { userId } = req.body;

    const community = await Community.findById(communityId);
    const user = await User.findById(userId);

    community.members = community.members.filter(
      (memberId) => memberId.toString() !== userId
    );

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Server closed. Database instance disconnected");
  process.exit(0);
});
