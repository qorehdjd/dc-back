const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { pageNumber = 1, galleryName, optionName, inputText } = req.query;
  const findArg = { galleryName };
  if (optionName === '제목') {
    findArg.title = { $regex: inputText };
  }
  if (optionName === '내용') {
    findArg.content = { $regex: inputText };
  }
  if (optionName === '제목 내용') {
    findArg.title = { $regex: inputText };
    findArg.content = { $regex: inputText };
  }
  if (optionName === '글쓴이') {
    try {
      const writer = await User.findOne({ nickname: inputText });
      findArg.writer = writer?._id;
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
  console.log('findArg', findArg);
  try {
    const posts = await Post.find({ ...findArg }, { password: 0 })
      .populate('writer', {
        password: 0,
      })
      .sort([['_id', 'desc']])
      .limit(20)
      .skip((pageNumber - 1) * 20);
    const pageCount = await Post.countDocuments({ ...findArg });
    const lastPage = Math.ceil(pageCount / 20);
    return res.status(200).json({ posts, lastPage });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
