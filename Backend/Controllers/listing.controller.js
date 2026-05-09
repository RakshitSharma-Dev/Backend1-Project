import Listing from "../models/listing.model.js";
import Review from "../models/review.model.js";
import ExpressError from "../Middlewares/ExpressError.js";
import { cloudinary } from "../utils/cloudinary.js";
import dotenv from 'dotenv';
dotenv.config();

const geocode = async (location, country) => {
    try {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'HotspotApp/1.0' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        }
        return [0, 0];
    } catch {
        return [0, 0];
    }
};

export const getAllListings = async (req, res) => {
    const search = req.query.search || "";

    const allListings = await Listing.find(
        search ? {
            $and: [
                { isPublished: { $ne: false } },
                {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { location: { $regex: search, $options: "i" } },
                        { country: { $regex: search, $options: "i" } },
                    ]
                }
            ]
        } : { isPublished: { $ne: false } }
    );

    res.render("listings/index.ejs", { allListings, search });
}

export const getAllListingsById = async (req, res, next) => {
    let { id } = req.params;
    const showListing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
                select: 'firstName lastName username',
            }
        })
        .populate('owner');

    if (!showListing) {
        req.flash("error", "Listing you are looking for does not exist!");
        return res.redirect('/listing');
    }

    req.session.recentlyViewed = req.session.recentlyViewed || [];
    if (!req.session.recentlyViewed.includes(id)) {
        req.session.recentlyViewed.unshift(id);
        req.session.recentlyViewed = req.session.recentlyViewed.slice(0, 5);
    }

    res.render("listings/show.ejs", { showListing });
}

export const postTheListning = async (req, res) => {
    res.render("listings/new.ejs");
}

export const postingNewListing = async (req, res, next) => {
    if (!req.body.listing) {
        return next(new ExpressError(400, "Invalid listing data!"));
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    const coordinates = await geocode(req.body.listing.location, req.body.listing.country);
    newListing.geometry = { type: 'Point', coordinates };

    if (req.files && req.files.length > 0) {
        newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        newListing.image = { url: req.files[0].path, filename: req.files[0].filename };
    }

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect('/listing');
}

export const editTheListing = async (req, res, next) => {
    let { id } = req.params;
    const getListing = await Listing.findById(id);

    if (!getListing) {
        return next(new ExpressError(404, "Listing not found!"));
    }

    res.render('listings/edit.ejs', { getListing });
}

export const putTheChanges = async (req, res, next) => {
    let { id } = req.params;

    if (!req.body.listing) {
        return next(new ExpressError(400, "Invalid listing data!"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true, runValidators: true }
    );

    if (!updatedListing) {
        return next(new ExpressError(404, "Listing not found!"));
    }

    const coordinates = await geocode(req.body.listing.location, req.body.listing.country);
    updatedListing.geometry = { type: 'Point', coordinates };

    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        updatedListing.images.push(...newImages);
        updatedListing.image = { url: req.files[0].path, filename: req.files[0].filename };
    }

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedListing.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } }
        });
    }

    await updatedListing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listing/${id}`);
}

export const deleteTheListing = async (req, res, next) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        return next(new ExpressError(404, "Listing not found!"));
    }

    if (deletedListing.images && deletedListing.images.length > 0) {
        for (let img of deletedListing.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }

    req.flash("success", "Listing deleted successfully!");
    res.redirect('/listing');
}

export const toggleAvailability = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        return next(new ExpressError(404, "Listing not found!"));
    }

    listing.isAvailable = !listing.isAvailable;
    listing.listingStatus = listing.isAvailable ? 'active' : 'unavailable';
    await listing.save();

    req.flash("success", `Listing is now ${listing.isAvailable ? 'available' : 'unavailable'}!`);
    res.redirect(`/listing/${id}`);
}

export const togglePublished = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        return next(new ExpressError(404, "Listing not found!"));
    }

    listing.isPublished = !listing.isPublished;
    listing.listingStatus = listing.isPublished ? 'active' : 'unpublished';
    await listing.save();

    req.flash("success", `Listing is now ${listing.isPublished ? 'published' : 'unpublished'}!`);
    res.redirect(`/listing/${id}`);
}

export const savingReview = async (req, res, next) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listing/${listing._id}`);
}

export const deletingReview = async (req, res, next) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listing/${id}`);
}