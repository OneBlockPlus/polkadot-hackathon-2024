// backend/routes/videos.js
const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const mongoose = require('mongoose');

// Add a new YouTube video
router.post('/', async (req, res) => {
    const {youtubeUrl} = req.body;
    try {
        const existingVideo = await Video.findOne({youtubeUrl});
        if (existingVideo) {
            return res.status(400).json({message: 'Video already exists'});
        }
        const newVideo = new Video({_id: new mongoose.Types.ObjectId().toString(), youtubeUrl, productAds: []});
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// DELETE a video by ID
router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const deletedVideo = await Video.findByIdAndDelete(id);
        if (!deletedVideo) {
            return res.status(404).json({message: 'Video not found'});
        }
        res.json({message: 'Video deleted successfully'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// DELETE an ad from a specific video
router.delete('/:videoId/ads/:adId', async (req, res) => {
    const {videoId, adId} = req.params;
    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({message: 'Video not found'});
        }

        const adIndex = video.productAds.findIndex(ad => ad._id.toString() === adId);
        if (adIndex === -1) {
            return res.status(404).json({message: 'Ad not found'});
        }

        video.productAds.splice(adIndex, 1);
        await video.save();

        res.json({message: 'Ad deleted successfully'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Add a product ad to a video
router.post('/:id/ads', async (req, res) => {
    const {id} = req.params;
    const {title, walletAddress, image, price, timingStart, timingEnd} = req.body;
    try {
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({message: 'Video not found'});
        }
        const newAd = {
            _id: new mongoose.Types.ObjectId().toString(),
            title,
            walletAddress,
            image,
            price,
            timingStart,
            timingEnd
        };
        video.productAds.push(newAd);
        await video.save();
        res.status(201).json(newAd);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Get ads for a specific video
router.get('/:id/ads', async (req, res) => {
    const {id} = req.params;
    try {
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({message: 'Video not found'});
        }
        res.json(video.productAds);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Get a specific ad from a video by adId
router.get('/:videoId/ads/:adId', async (req, res) => {
    const {videoId, adId} = req.params;
    try {
        // Find the video by videoId
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({message: 'Video not found'});
        }

        // Find the specific ad by adId within the productAds array
        const ad = video.productAds.find(ad => ad._id.toString() === adId);
        if (!ad) {
            return res.status(404).json({message: 'Ad not found'});
        }

        // Respond with the found ad
        res.json(ad);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;