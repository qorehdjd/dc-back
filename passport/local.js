const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');

const User = require('../models/User');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'id', // req.body.nickname
        passwordField: 'password', // req.body.password
      },
      async (id, password, done) => {
        try {
          const user = await User.findOne({ id });
          if (!user) return done(null, false, { reason: '존재하지 않는 유저입니다' }); //인자 첫번째 서버에러 두번째 성공했을때 세번째 클라이언트에러
          const passwordCheck = await bcrypt.compare(password, user.password);
          if (!passwordCheck)
            return done(null, false, {
              reason: '비밀번호가 일치하지 않습니다',
            });
          return done(null, user);
        } catch (err) {
          console.error(err);
          return done(err);
        }
      },
    ),
  );
};
