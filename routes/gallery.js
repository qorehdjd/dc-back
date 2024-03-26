const express = require('express');
const Gallery = require('../models/Gallery');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { id: name } = req.query;
  // const trimName = id.replace(/ /g, "");
  console.log('req.query', req.query);
  try {
    const gallery = await Gallery.findOne({ name }).populate('posts').populate('writer', { password: 0 });
    console.log('gal', gallery);
    if (!gallery) {
      return res.status(500).send('존재하지 않는 갤러리입니다.');
    }
    return res.status(200).json(gallery);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
