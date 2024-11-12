const allowedOrigin = require("./allowedOrigin");
const corsOptions = {
  origin: (origin, callbak) => {
    if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
      callbak(null, true);
    } else {
      callbak(new Error("not allowed by Cors"));
    }
  },
  credentials: true,
  opstionSuccessStatus: 200,
};

module.exports = corsOptions;
