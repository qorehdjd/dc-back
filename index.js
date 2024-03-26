const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const postRouter = require('./routes/gallery');
const userRouer = require('./routes/user');
const postRouer = require('./routes/post');
const postRouers = require('./routes/posts');
const passportConfig = require('./passport');
const hpp = require('hpp');
const { default: helmet } = require('helmet');

const app = express();
dotenv.config();
passportConfig();

const { PORT, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected!'))
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === 'production') {
  console.log(123);
  app.use(hpp());
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // origin: ['http://localhost:3000', 'http://localhost:3080', 'https://www.portpolio-dcinside.site'],
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser(process.env.SECRET_KEY));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // 스크립트 공격 방어 (XSS)
      secure: true,
    },
  }),
);

app.use(passport.initialize()); // 요청 객체에 passport 설정을 심음
app.use(passport.session());
// passport.session()이 실행되면, 세션쿠키 정보를 바탕으로 해서 passport/index.js의 deserializeUser()가 실행하게 한다

app.get('/', (req, res) => {
  return res.send('logout');
});

app.use('/gallery', postRouter);
app.use('/user', userRouer);
app.use('/post', postRouer);
app.use('/posts', postRouers);

app.listen(PORT, () => {
  console.log(`${PORT}번 실행중`);
});
