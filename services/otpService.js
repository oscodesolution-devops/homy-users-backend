import admin from "../config/firebase.config.js";

const auth = admin.auth();

const sendOtp = async(phoneNumber)=>{
  try {
    console.log(phoneNumber)
    // Create a custom token for phone authentication
    const customToken = await auth.createCustomToken(String(phoneNumber));
    console.log(customToken)
    return {
      success: true,
      message: 'OTP initiated successfully',
      customToken: customToken
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

const verifyFirebaseOtp = async(phoneNumber, idToken)=>{
  try {
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if the phone number matches
    if (decodedToken.phone_number === phoneNumber) {
      return {
        success: true,
        message: 'OTP verified successfully',
        uid: decodedToken.uid
      };
    }
    
    return {
      success: false,
      message: 'Phone number verification failed'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'OTP verification failed',
      error: error.message
    };
  }
}

export {sendOtp,verifyFirebaseOtp}