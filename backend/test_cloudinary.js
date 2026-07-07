const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: 'dzladbhvc',
  api_key: '414666782692157',
  api_secret: '4pTJeYzAFkXg0g8809XnTvPxYGo'
});

const uniqueId = `test_${Date.now()}`;

const uploadStream = cloudinary.uploader.upload_stream({
  folder: 'resumes',
  resource_type: 'raw',
  type: 'upload',
  public_id: uniqueId
}, (error, result) => {
  if (error) {
    console.error('CLOUDINARY ERROR:', error);
  } else {
    console.log('SUCCESS:', result.secure_url);
  }
});
uploadStream.end(Buffer.from('dummy pdf data'));
