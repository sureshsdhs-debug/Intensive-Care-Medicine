// backend/helpers/fileHelper.js
const fs = require('fs');
const path = require('path');

/**
 * Delete an uploaded file from the uploads folder.
 * Accepts:
 *  - full URL (http://host/uploads/filename.jpg)
 *  - relative path (/uploads/filename.jpg)
 *  - just filename (filename.jpg)
 */
exports.deleteUploadedFile = function (imageRef) {
  try {
    if (!imageRef) return;

    // extract filename from URL or path
    let filename = imageRef;
    try {
      const parsed = new URL(imageRef);
      filename = path.basename(parsed.pathname);
    } catch (e) {
      filename = path.basename(imageRef);
    }

    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✔ Deleted old upload file:', filePath);
    } else {
      console.log('ℹ️ Old upload file not found (nothing to delete):', filePath);
    }
  } catch (err) {
    console.warn('⚠ deleteUploadedFile error (ignored):', err.message);
  }
};
