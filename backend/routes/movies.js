const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
  const [movies] = await db.query('SELECT * FROM movies');
  res.json(movies);
});

module.exports = router;
