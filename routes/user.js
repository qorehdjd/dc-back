const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user._id }, { password: 0 });
      return res.status(200).json(user);
    } else {
      return res.status(200).json(null);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/signup', async (req, res, next) => {
  const { id, password, nickname } = req.body;
  try {
    const exUser = await User.findOne({ nickname });
    if (exUser) {
      return res.status(400).send('이미 존재하는 아이디입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({ id, nickname, password: hashedPassword });
    await user.save();
    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/login', (req, res, next) => {
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      if (info) {
        console.log(info);
        return res.status(401).send(info.reason);
      }
      return req.login(user, async (loginErr) => {
        // passport 자체 로그인 에러 login함수 실행되면 serializeUser실행
        if (loginErr) {
          console.error(loginErr);
          return next(loginErr);
        }
        // res.setHeader('Cookie', 'chgrgr') 알아서 쿠키를 만들어준다.
        const fullUserWithoutPassword = await User.findOne(
          { _id: user._id },
          {
            password: 0,
          },
        );
        // req.session.cookie.expires = new Date(Date.now() + 360000);
        return res.status(200).json(fullUserWithoutPassword);
      });
    })(req, res, next);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
