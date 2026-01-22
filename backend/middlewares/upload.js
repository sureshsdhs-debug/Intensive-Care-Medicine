const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "answeraudio") {
      return {
        folder: "questions/audio",
        resource_type: "video", // Cloudinary treats audio as video
        allowed_formats: ["mp3", "wav", "ogg"],
      };
    }

    return {
      folder: "questions/images",
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
