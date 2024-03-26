const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const postSchema = mongoose.Schema({
  // 스키마는 구조, 유효성, 기본값을 부여하는 과정
  galleryName: String,
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  image: [{ type: String, url: String }],
  liker: [
    {
      nickname: String,
    },
  ],
  disliker: [
    {
      nickname: String,
    },
  ],
  visitor: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  createDate: {
    type: Date,
    default: () => new Date(),
  },
});

postSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Post = mongoose.model('Post', postSchema); // 스키마를 이용해서 모델을 만들고 모델로 생성,제거,추가 등등이 가능하다.

module.exports = Post;
