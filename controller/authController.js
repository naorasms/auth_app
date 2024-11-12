const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(404).json({ message: "all faild is required" });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (foundUser) {
    res.status(401).json({ message: "this user is exists" });
  }

  const hashPass = await bcrypt.hash(password, 10);

  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashPass,
  });

  const accessToken = jwt.sign(
    {
      userinfo: {
        id: user._id,
      },
    },
    process.env.ACCESS_SECRET_TOKEN,
    {
      expiresIn: "1m",
    }
  );
  const refershToken = jwt.sign(
    {
      userinfo: {
        id: user._id,
      },
    },
    process.env.REFRESH_SECRET_TOKEN,
    {
      expiresIn: "7d",
    }
  );
  res.cookie("jwt", refershToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.json({
    accessToken,
    fist_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({ message: "all faild is required" });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    res.status(401).json({ message: "this user dose not exists" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "password is wroing" });

  const accessToken = jwt.sign(
    {
      userinfo: {
        id: foundUser._id,
      },
    },
    process.env.ACCESS_SECRET_TOKEN,
    {
      expiresIn: "1m",
    }
  );
  const refershToken = jwt.sign(
    {
      userinfo: {
        id: foundUser._id,
      },
    },
    process.env.REFRESH_SECRET_TOKEN,
    {
      expiresIn: "7d",
    }
  );
  res.cookie("jwt", refershToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.json({
    accessToken,
    email: foundUser.email,
  });
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) res.status(401).json({ message: "unauthorazied" });
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET_TOKEN,
    async (err, decoded) => {
      if (err) res.status(403).json({ message: "forbedden" });
      const foundUser = await User.findById(decoded.userinfo.id).exec();
      if (!foundUser) res.status(401).json({ message: "unauthorazied" });
      const accessToken = jwt.sign(
        {
          userinfo: {
            id: foundUser._id,
          },
        },
        process.env.ACCESS_SECRET_TOKEN,
        {
          expiresIn: "1m",
        }
      );
      res.json(accessToken);
    }
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) res.sendStatus(204);
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({ message: "u are out" });
};
module.exports = {
  register,
  login,
  refresh,
  logout,
};
