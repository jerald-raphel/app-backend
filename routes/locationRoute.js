const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// @POST /location — Save place name
router.post('/', async (req, res) => {
  try {
    const { place, timestamp } = req.body;
    const newLocation = new Location({ place, timestamp });
    await newLocation.save();
    res.status(201).json({ message: 'Location saved successfully' });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

module.exports = router;
