const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  // 스키마는 구조, 유효성, 기본값을 부여하는 과정
  id: {
    type: String,
    required: true,
    maxLength: 10,
  },
  nickname: {
    type: String,
    required: true,
    maxLength: 10,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
  likePosts: [
    {
      postId: String,
    },
  ],
  dislikePosts: [
    {
      postId: String,
    },
  ],
});

const User = mongoose.model('User', UserSchema); // 스키마를 이용해서 모델을 만들고 모델로 생성,제거,추가 등등이 가능하다.

module.exports = User;
