// Comment Document Schema
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxLength: 500,
  },
  commentedBy: {
    type: String,
    required: false,
  },
  commentedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  commentIDs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  //Upvotes
    upvotes: {
        type: Number,
        required: true,
        default: 0,
    },
    upvoteMembers: [
        {
            type: String,
        },
    ],
    downvoteMembers: [
        {
            type: String,
        },
    ],
});

commentSchema.virtual("url").get(function () {
  return `comments/${this._id}`;
});

module.exports = mongoose.model("Comment", commentSchema);