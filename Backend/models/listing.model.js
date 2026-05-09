import mongoose from 'mongoose';
import Review from './review.model.js';
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        maxLength: [100, "Title must not exceed 100 characters"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxLength: [2000, "Description must not exceed 2000 characters"],
    },
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2" : v,
        }
    },
    images: [
        {
            url: String,
            filename: String,
        }
    ],
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
        max: [1000000, "Price cannot exceed 1,000,000"],
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
        maxLength: [100, "Location must not exceed 100 characters"],
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        maxLength: [60, "Country must not exceed 60 characters"],
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        }
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    listingStatus: {
        type: String,
        enum: ['active', 'unavailable', 'unpublished'],
        default: 'active',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;