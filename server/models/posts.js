// Post Document Schema
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 100 },
  content: { type: String, required: true },
  postedBy: { type: String, required: false },
  postedDate: { type: Date, required: true, default: Date.now },
  views: { type: Number, required: true, default: 0 },
  linkFlairID: [{ type: mongoose.Schema.Types.ObjectId, ref: "LinkFlair" }],
  commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  upvoteMembers: [{ type: String }],
  upvotes: { type: Number, required: true, default: 0 },
});


postSchema.virtual("url").get(function () {
  return `posts/${this._id}`;
});

module.exports = mongoose.model("Post", postSchema);