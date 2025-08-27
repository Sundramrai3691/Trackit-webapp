import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage });

// BoltPatch: Add uploadArray for multiple images
export const uploadArray = multer({ storage: storage }).array('images', 6);