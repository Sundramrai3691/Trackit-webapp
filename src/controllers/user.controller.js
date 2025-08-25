import { User } from "../models/users.models.js";
import jsonwebtoken from "jsonwebtoken";
const jwt = jsonwebtoken;

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { Item } from "../models/Items.models.js";
import { io } from "../socket.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/emails.js";
import { Otp } from "../models/otp.modles.js";
import { EmailVerification } from "../models/EmailVerification.models.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const options = {
  httpOnly: true,
  secure: true, // secure only in production
};

// Generate tokens
const generateAcessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "unauthorized user");
    }
    // console.log(user.toObject());

    const accessToken = user.generateAccessToken();
    console.log("error for this", accessToken);
    const refreshToken = user.generateRefreshToken();
    //console.log(accessToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access Token"
    );
  }
};

// Sign up controller
const signUpUser = asyncHandler(async (req, res) => {
  const { name, password, email, phone } = req.body;

  if (
    [name, password, email, phone].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone should have exactly 10 digits");
  }

  const checkUser = await User.findOne({ userEmail: email });
  if (checkUser) {
    throw new ApiError(409, "User already registered");
  }

  const hashedPassword = await bcrypt.hash(password,10)

  const token = jwt.sign(
  { email,
    name,
    phone,
    hashedPassword
   },  // only keep what you need
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: "1d" }   // token valid for 1 day
);
    // console.log('The token is ',token);
  // 3. Save email + credentials temporarily in EmailVerification collection
  await EmailVerification.create({
    userEmail: email,
    token,
    credentials: { name, password, phone },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // 4. Construct verification link
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  // console.log(verificationLink);
  //  console.log('The token is ',token);
  // 5. Send verification email
  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    text: `Click the link to verify your email: ${verificationLink}`,
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
  });

  // 6. Respond
  res.status(200).json({
    message: "Verification link sent. Check your email to complete signup.",
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Verification token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(400, "Invalid or expired verification link");
  }

  // Check if user already exists
  const isPresent = await User.findOne({ email: decoded.email });
  if (isPresent) {
    throw new ApiError(400, "User already exists");
  }

  // Create the user
  const user = await User.create({
    name: decoded.name,
    email: decoded.email,
    phone: decoded.phone,
    password: decoded.hashedPassword,
    isVerified: true,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }


  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
  
});

// Login controller
const loginUser = asyncHandler(async (req, res) => {
  const {  password, email } = req.body;

  if (
    [ password, email].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // find user with password included
  const user = await User.findOne({ email }).select(" -refreshToken");
  if (!user) {
    throw new ApiError(401, "Unauthorized user");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Credentials given are wrong");
  }

  // generate tokens
  const { refreshToken, accessToken } = await generateAcessAndRefreshTokens(
    user?._id
  );

  // get safe user object
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken;
    if (!incomingToken) {
      throw new ApiError(401, "Unauthorized user");
    }

    const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) {
      throw new ApiError(401, "Unauthorized user");
    }

    const user = await User.findById(decoded?.id);
    if (!user) {
      throw new ApiError(401, "Unauthorized user");
    }

    // Generate new tokens
    const { accessToken } = await generateAcessAndRefreshTokens(user._id);

    // Send new tokens as cookies
    // console.log(accessToken)
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json({ success: true });
  } catch (error) {
    throw new ApiError(401, "Refreshed AccessToken cannot be generated");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const postItem = asyncHandler(async (req, res) => {
  const user = req.user;
  const images = req.files?.ImageTrackList || [];

  // If no images uploaded
  if (!images.length) {
    throw new ApiError(400, "At least one image is required");
  }

  // Extract paths
  const imagesPath = images.map((file) => file?.path || null);

  // Upload to Cloudinary
  const imagesUrl = [];
  for (const localpath of imagesPath) {
    if (localpath) {
      console.log(localpath);
      const url = await uploadonCloudinary(localpath);
      imagesUrl.push(url.url);
    }
  }

  if (!imagesUrl.length) {
    throw new ApiError(400, "At least one image is required");
  }

  const {
    itemName,
    category,
    locationFound,
    dateFound,
    status,
    name,
    email,
    phone,
    type,
    description,
  } = req.body;

  // Manual validation with ApiError
  if (!itemName || typeof itemName !== "string") {
    throw new ApiError(400, "Item name is required and must be a string");
  }

  if (!category || typeof category !== "string") {
    throw new ApiError(400, "Category is required and must be a string");
  }

  if (!locationFound || typeof locationFound !== "string") {
    throw new ApiError(400, "Location is required and must be a string");
  }

  if (
    !dateFound ||
    !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(dateFound)
  ) {
    throw new ApiError(400, "Date is required and must be valid (YYYY-MM-DD)");
  }

  if (!status || !["Available", "Claimed"].includes(status)) {
    throw new ApiError(400, "Status must be either 'Available' or 'Claimed'");
  }

  if (!type || !["Found", "Lost"].includes(type)) {
    throw new ApiError(400, "Type must be either 'Found' or 'Lost'");
  }

  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Name is required and must be a string");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Valid email is required");
  }

  if (!phone || !/^\d{10,15}$/.test(phone)) {
    throw new ApiError(400, "Valid phone number is required");
  }

  if (description && typeof description !== "string") {
    throw new ApiError(400, "Description must be a string");
  }

  // now insert all these thngs in item schema and at last make io.emit for real time update

  const createdItem = await Item.create({
    itemName,
    description,
    category,
    type,
    dateFound,
    images: imagesUrl,
    reportedBy: req.user._id,
    name,
    email,
    phone,
    status,
    location: locationFound,
  });

  if (!createdItem) {
    throw new ApiError(500, "Failed to create item");
  }
  io.emit("newItemPosted", createdItem);

  res
    .status(201)
    .json(
      new ApiResponse(201, createdItem, "item has been injected in database")
    );
});

const userPosts = asyncHandler(async (req, res) => {
  const user = req.user;

  const userData = await Item.aggregate([
    { $match: { reportedBy: user._id } },
    { $sort: { createdAt: -1 } }, // latest first
    {
      $project: {
        email: 0,
        reportedBy: 0,
        __v: 0,
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: 1 },
        items: { $push: "$$ROOT" },
      },
    },
  ]);

  if (userData.length === 0) {
    throw new ApiError(404, "No posts have been made by user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userData, "User posts have been retrieved"));
});

const deletePosts = asyncHandler(async (req, res) => {
  const user = req.user;
  const itemToDeleteId = req.query.itemId;

  if (!itemToDeleteId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Item ID is required"));
  }

  // Try deleting the item
  const deletedItem = await Item.findByIdAndDelete(itemToDeleteId);

  if (!deletedItem) {
    return res.status(404).json(new ApiResponse(404, null, "Item not found"));
  }

  //  Notify all clients in real-time
  io.emit("itemDeleted", deletedItem._id);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedItem, "Item deleted successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized user");
  }

  const OTP = generateOtp();

  await Otp.create({
    userId: user._id,
    otp: OTP,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // valid for 5 minutes
  });

  const detailsToSend = {
    to: user.email,
    subject: "This is the otp for your password reset",
    text: `otp is ${OTP}`,
  };
  await sendEmail(detailsToSend);

  res.status(200).json({ message: "OTP sent successfully" });
});

const passwordReset = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;
  const user = req.user;
  if (!newPassword) {
    throw new ApiError(400, "Passoword is required");
  }

  const validOtp = await Otp.findOne({ userId: user._id, otp });
  if (!validOtp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  if (!user.isPasswordCorrect(newPassword)) {
    throw new ApiError(500, "something happend while changing the password");
  }

  return res
    .status(200)
    .json({ message: "Password has been changed successfully" });
});

export {
  signUpUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  postItem,
  userPosts,
  deletePosts,
  passwordReset,
  forgotPassword,
  verifyEmail,
};
