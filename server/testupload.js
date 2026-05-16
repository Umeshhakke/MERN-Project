require('dotenv').config();
const cloudinary = require('./config/cloudinary');

cloudinary.uploader.upload('./test.png', { folder: 'test' }, (error, result) => {
  if (error) {
    console.log('Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Uploaded:', result.secure_url);
  }
});