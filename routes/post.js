const express = require('express');
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Replycomment = require('../models/ReplyComment');
const User = require('../models/User');

const router = express.Router();

router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).populate('writer', {
      password: 0,
    });
    if (!post) {
      return res.status(400).send('존재하지 않는 게시글입니다.');
    }
    post.visitor += 1;
    const comments = await Comment.find({ postId: req.params.postId }).sort([['_id', 'desc']]);
    post.comments = comments;
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { title, content, password, galleryName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const post = await new Post({
      galleryName,
      title,
      content,
      password: hashedPassword,
      writer: req.user._id,
    });
    await post.save();
    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/', async (req, res, next) => {
  const { postId, title, content } = req.body;
  try {
    const post = await Post.findOne({ _id: postId }, { password: 0 });
    if (!post) {
      return res.status(400).send('존재하지 않는 게시글입니다.');
    }
    post.title = title;
    post.content = content;
    post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId/:password', async (req, res, next) => {
  const { postId, password } = req.params;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(400).send('존재하지 않는 게시글입니다.');
    }
    const passwordCheck = await bcrypt.compare(password, post.password);
    if (!passwordCheck) {
      return res.status(400).send('비밀번호가 일치하지 않습니다');
    }
    const comments = await Comment.find({ postId: post._id });
    comments.forEach((comment) => {
      comment.replyComments.forEach(async (replyComment) => {
        await Replycomment.deleteOne({ commentId: comment._id });
      });
    });
    await Post.deleteOne({
      _id: postId,
    });
    await Comment.deleteMany({ postId: post._id });
    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/comment', async (req, res, next) => {
  const { content, password, postId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const comment = await new Comment({
      postId,
      content,
      password: hashedPassword,
      nickname: req.user.nickname,
    });
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete('/comment/:commentId/:password', async (req, res, next) => {
  try {
    const { commentId, password } = req.params;
    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) {
      return res.status(400).send('존재하지 않는 댓글입니다');
    }
    const passwordCheck = await bcrypt.compare(password, comment.password);
    if (!passwordCheck) {
      return res.status(400).send('비밀번호가 일치하지 않습니다');
    }
    await Comment.deleteOne({
      _id: commentId,
      password: comment.password,
    });
    await Replycomment.deleteMany({
      commentId,
    });
    return res.status(200).json({ commentId });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/replyComment', async (req, res, next) => {
  const { content, password, commentId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const replyComment = await new Replycomment({
      commentId,
      nickname: req.user.nickname,
      content,
      password: hashedPassword,
    });
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      {
        $push: { replyComments: replyComment },
      },
      { new: true },
    );
    await replyComment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/replyComment/:replyCommentId/:password', async (req, res, next) => {
  try {
    const { replyCommentId, password } = req.params;
    const replyComment = await Replycomment.findOne({
      _id: replyCommentId,
    });
    if (!replyComment) {
      return res.status(400).send('존재하지 않는 댓글입니다');
    }
    const passwordCheck = await bcrypt.compare(password, replyComment.password);
    if (!passwordCheck) {
      return res.status(400).send('비밀번호가 일치하지 않습니다');
    }
    await Replycomment.deleteOne({
      _id: replyCommentId,
      password: replyComment.password,
    });
    await Comment.updateOne(
      {
        _id: replyComment.commentId,
      },
      {
        $pull: { replyComments: { _id: replyCommentId } },
      },
    );
    const data = {
      replyCommentId,
      commentId: replyComment.commentId,
    };
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/like/:postId', async (req, res, next) => {
  try {
    const post = await Post.updateOne(
      { _id: req.params.postId },
      {
        $push: { liker: { nickname: req.user.nickname } },
      },
    );
    if (!post) {
      return res.status(400).send('존재하지 않는 게시글입니다');
    }
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: { likePosts: { postId: req.params.postId } },
      },
    );
    return res.status(200).json({ nickname: req.user.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/dislike/:postId', async (req, res, next) => {
  try {
    const post = await Post.updateOne(
      { _id: req.params.postId },
      {
        $push: { disliker: { nickname: req.user.nickname } },
      },
    );
    if (!post) {
      return res.status(400).send('존재하지 않는 게시글입니다');
    }
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: { dislikePosts: { postId: req.params.postId } },
      },
    );
    return res.status(200).json({ nickname: req.user.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/comparePassword', async (req, res, next) => {
  const { password, postId } = req.body;
  try {
    const post = await Post.findOne({ _id: postId });
    const passwordCheck = await bcrypt.compare(password, post.password);
    if (!passwordCheck) {
      return res.status(400).send('비밀번호가 일치하지 않습니다');
    }
    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
