const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
  postId: String,
  nickname: String,
  content: String,
  password: String,
  createDate: {
    type: Date,
    default: () => new Date(),
  },
  replyComments: [
    {
      commentId: String,
      nickname: String,
      content: String,
      password: String,
      createDate: {
        type: Date,
        default: () => new Date(),
      },
    },
  ],
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
