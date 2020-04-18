const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      "/home/ryanadhi/Documents/Hacktiv8/Phase3/week4/final_project/server/tests/public/"
    );
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage });

module.exports = upload;
