import mongoose from 'mongoose';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const passportLocalMongoose = require('passport-local-mongoose').default;

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxLength: [50, "First name must not exceed 50 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxLength: [50, "Last name must not exceed 50 characters"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
export default User;