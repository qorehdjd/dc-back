const mongoose = require('mongoose');

const ReplycommentSchema = mongoose.Schema({
  commentId: String,
  nickname: String,
  content: String,
  password: String,
  createDate: {
    type: Date,
    default: () => new Date(),
  },
});

const Replycomment = mongoose.model('Replycomment', ReplycommentSchema);

module.exports = Replycomment;
