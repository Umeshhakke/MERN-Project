const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

//@desc Register a new user
//@route Post /api/auth/register
//@access Public

const registerUser = async(req,res)=>{
    const{username , email , password } = req.body;

    try{
        const userExists = await User.findOne({$or: [{email} , {username}]});

        if(userExists){
            return res.status(400).json({
                message:'user already exits with that email or username',
            });
        }
        const user = await User.create({
            username,
            email,
            password,
        });
        res.status(201).json({
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePic:user.profilePic,
            bio: '',
        });
    }catch (error){
        res.status(500).json({
            message:`Server Error`, error:error.message
        });
    }
};

//@dec Login user & get token
//@route POST /api/auth/login
//@access Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;  // <-- make sure it's req, not res

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body && req.body.bio !== undefined) {
    user.bio = req.body.bio;
}

    // If a new profile picture is uploaded, upload to Cloudinary
    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'profile-pics' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const result = await uploadToCloudinary();
      user.profilePic = result.secure_url;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      bio: updatedUser.bio,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports={registerUser , loginUser , getUserProfile,updateUserProfile };