const asyncHandler = require('express-async-handler');
const otpGenerator = require('otp-generator');
const User = require("../model/UserModel");
const jwt =  require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require('../constants');
const { sendEmail, sendMail2 } = require('../helper/sendEmail');

const crypto = require('crypto');

// Helper function to generate public/private key pair
// Function to generate a random string
const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(crypto.randomInt(0, charactersLength)));
  }
  return result;
};

// Function to generate public and private keys
const generateKeys = () => {
  const publicKey = `cp_public_${generateRandomString(20)}`; // 16 characters after prefix
  const privateKey = `cp_private_${generateRandomString(20)}`; // 16 characters after prefix
  return { publicKey, privateKey };
};


// @desc    Request OTP
// @route   POST /api/auth/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }
  
    const generatedOtp = otpGenerator.generate(6, { 
      digits: true,
      upperCaseAlphabets: false, 
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  
    let user = await User.findOne({ email });
  
    if (user) {
      user.otp = generatedOtp;
      user.otpExpires = otpExpires;
    } else {
      user = new User({
        email,
        otp: generatedOtp,
        otpExpires,
      });
    }
  
    await user.save();

     const  OTP_TEMPLATE_UUID  = "27f076d6-ee0a-47ff-bad4-126fe01bb1bf"

     const recipients = [
      {
        email: email,
      }
    ];
  
    await sendMail2(recipients, OTP_TEMPLATE_UUID, {
      "user_email":  email,
      "otp_code":  generatedOtp,
      "user_name": "Test_User_name",
      "next_step_link": "Test_Next_step_link",
      "get_started_link": "Test_Get_started_link",
      "onboarding_video_link": "Test_Onboarding_video_link"
    });
  
    res.status(200).json({ otp: generatedOtp});
  });


  // @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, enteredOtp } = req.body;
  
    const user = await User.findOne({ email });

     


    //  REMOVED EXPIRATION CHECK FOR  TESTING  I'LL ADD IT LATER 
      // || user.otpExpires < Date.now()

      if (!enteredOtp ) {
        res.status(400);
        throw new Error('NO otp provided');
      }
  
    if (!user || user.otp !== Number(enteredOtp)) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }
  
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
  
    await user.save();

    const token =  jwt.sign({id : user._id},  ACCESS_TOKEN_SECRET, {expiresIn : "5h"} )
  
    res.status(200).json({
      _id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      token: token,
    });
  });


 /* const updateUserInfo = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, businessName, brandColor, wallet } = req.body;
  
    try {
      // Find the user by ID and update their information
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, businessName, brandColor, wallet },
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User information updated successfully', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });*/

  // Update user information (and generate keys if needed)
const updateUserInfo = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, businessName, brandColor, wallet } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If keys don't exist, generate them
    if (!user.publicKey || !user.privateKey) {
   // Generate the keys
const { publicKey, privateKey } = generateKeys();
      user.publicKey = publicKey;
      user.privateKey = privateKey;
    }

    // Update user information
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.businessName = businessName || user.businessName;
    user.brandColor = brandColor || user.brandColor;
    user.wallet = wallet || user.wallet;

    // Save updated user
    await user.save();

    res.status(200).json({
      message: 'User information updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        brandColor: user.brandColor,
        wallet: user.wallet,
        publicKey: user.publicKey,
        privateKey: user.privateKey // You may want to remove this in production!
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

    const getUserProfile = asyncHandler (async (req, res)  =>  {
       const {id} =  req.params

       if(! id){
        res.status(400).json({message : "There is no id specified "})
        throw new Error("NO ID SPECIFIED");
        
       }
         const user =  await User.findById(id)

         res.status(200).json({
          user
         })

    })
  


   module.exports  =  {requestOtp, verifyOtp, getUserProfile, updateUserInfo}