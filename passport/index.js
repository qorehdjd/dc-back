const passport = require('passport');
const local = require('./local');
const User = require('../models/User');

module.exports = () => {
  passport.serializeUser((user, done) => {
    // 로그인했을 때 쿠키를 보내준다.
    done(null, user._id); // user의 id만 따로 저장 모든 정보를 가지게되면 메모리 문제 발생하기때문
  });

  passport.deserializeUser(async (_id, done) => {
    // 로그인한뒤 사용자가 다음요청을 보낼때 실행
    try {
      const user = await User.findOne({ _id });
      done(null, user); //req.user에 user정보를 넣어준다.
    } catch (err) {
      console.error(err);
      done(err);
    }
  });
  local();
};
