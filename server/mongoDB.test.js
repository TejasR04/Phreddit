const mongoose = require('mongoose');
// Import models
const Post = require('./models/posts');
const Comment = require('./models/comments');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
});

test('Deletes post and its comments', async () => {
  // Create a post and some comments
  const post = await Post.create({ title: 'Test Post', content: 'Test Content' });
  const comment1 = await Comment.create({ postId: post._id, content: 'Test Comment 1' });
  const comment2 = await Comment.create({ postId: post._id, content: 'Test Comment 2', parentId: comment1._id });

  // Collect comment IDs
  const commentIds = [comment1._id, comment2._id];

  // Delete the post
  await Post.deleteOne({ _id: post._id });

  // Check that post and comments are deleted
  const deletedPost = await Post.findById(post._id);
  const deletedComments = await Comment.find({ _id: { $in: commentIds } });

  expect(deletedPost).toBeNull();
  expect(deletedComments).toHaveLength(0);
});
