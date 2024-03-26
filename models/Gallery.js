const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  visitor: Number,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createDate: {
    type: Date,
    default: () => new Date(),
  },
});

const Gallery = mongoose.model('Gallery', gallerySchema); // 스키마를 이용해서 모델을 만들고 모델로 생성,제거,추가 등등이 가능하다.

module.exports = Gallery;
