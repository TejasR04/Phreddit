// Community Document Schema
const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 500,
  },
  postIDs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  members: [
    {
      type: String,
      required: true,
    },
  ],
    creator: {
        type: String,
        required: true,
    },
});

communitySchema.virtual("url").get(function () {
  return `communities/${this._id}`;
});

module.exports = mongoose.model("Community", communitySchema);