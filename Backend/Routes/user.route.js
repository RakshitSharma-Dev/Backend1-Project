import express from 'express';
import {
    getRegisterForm,
    registerUser,
    getOTPForm,
    verifyOTP,
    resendOTP,
    getLoginForm,
    loginUser,
    logoutUser,
    getProfile,
} from '../Controllers/user.controller.js';
import wrapAsync from '../Middlewares/wrapAsync.js';
import validateUser from '../Middlewares/validateUser.js';
import isLoggedIn from '../Middlewares/isLoggedIn.js';
import passport from 'passport';

const router = express.Router();

router.get('/register', wrapAsync(getRegisterForm));
router.post('/register', validateUser, wrapAsync(registerUser));
router.get('/verify-otp', wrapAsync(getOTPForm));
router.post('/verify-otp', wrapAsync(verifyOTP));
router.get('/resend-otp', wrapAsync(resendOTP));
router.get('/login', wrapAsync(getLoginForm));
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
}), wrapAsync(loginUser));
router.get('/logout', logoutUser);
router.get('/profile', isLoggedIn, wrapAsync(getProfile));

export default router;