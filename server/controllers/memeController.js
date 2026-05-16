const Meme = require('../models/Meme');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// @desc Uploada new meme
// @route POST /api/memes
//@access Private
const createMeme= async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({message: 'Please Upload an image'});
        }
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                { folder: 'meme-university' },
                (error, result) => {
                    if (error) {
                    // Log the complete error to see what Cloudinary returned
                    console.log('Cloudinary upload error:');
                    console.log(JSON.stringify(error, null, 2));
                    reject(error);
                    } else {
                    resolve(result);
                    }
                }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
            };
        const result = await uploadToCloudinary();

        const meme = await Meme.create({
            user: req.user._id,
            imageUrl: result.secure_url,
            caption: req.body.caption || '',
        });
        const populatedMeme = await meme.populate('user','username profilepic');
        res.status(201).json(populatedMeme);
    }catch(error){
        console.log(error);
        res.status(500).json({message: 'server error', error: error.message});
    }
};

// @desc Get all memes (feed)
// @route GET /api/memes
// @access Public

const getMemes = async (req, res) => {
  try {
    const memes = await Meme.find()
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 });  
    res.json(memes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc get a single meme by ID
// @route GET /api/memes/:id
// @access Public
const getMemeById = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id) // use 'meme', not 'name'
      .populate('user', 'username profilePic')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePic' },
      });

    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    res.json(meme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc Delete a meme
// @route DELETE /api/meme/:id
// @access Privvate (only owner)
const deleteMeme=async(req,res)=>{
    try{
        const meme= await Meme.findById(req.params.id);
        if(!meme){
            return res.status(404).json({
                message: 'Meme not Found'
            });
        }
        if(meme.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message:'Not authorized'});
        }
        await meme.deleteOne();
        res.json({message:'Meme Deleted'});
    }catch(error){
        res.status(500).json({message: 'Server error',error:error.message});
    }
};

// @desc Like/Unlike a meme
// @route PUT /api/meme/:id/like
// @access Private
const toggleLike = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    const alreadyLiked = meme.likes.includes(req.user._id);

    if (alreadyLiked) {
      meme.likes.pull(req.user._id);
    } else {
      meme.likes.push(req.user._id);
    }

    await meme.save();
    res.json({ likes: meme.likes, likeCount: meme.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get memes by user ID
// @route   GET /api/memes/user/:userId
// @access  Public
const getUserMemes = async (req, res) => {
  try {
    const memes = await Meme.find({ user: req.params.userId })
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(memes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports={
    createMeme,
    getMemeById,
    getMemes,
    deleteMeme,
    toggleLike,
    getUserMemes,
};