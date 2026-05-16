const mongoose = require('mongoose');

const memeSchema= new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        imageUrl: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        caption: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Caption cannot exceed 500 characters'],
        },
        likes:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {timestamps: true}
);

const Meme = mongoose.model('Meme', memeSchema);

module.exports = Meme;

