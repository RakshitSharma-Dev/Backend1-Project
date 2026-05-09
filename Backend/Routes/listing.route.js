import express from 'express';
import {
    getAllListings,
    getAllListingsById,
    postTheListning,
    postingNewListing,
    editTheListing,
    putTheChanges,
    deleteTheListing,
    toggleAvailability,
    togglePublished,
    savingReview,
    deletingReview,
} from '../Controllers/listing.controller.js';
import wrapAsync from '../Middlewares/wrapAsync.js';
import validateListing from '../Middlewares/validateListing.js';
import validateReview from '../Middlewares/validateReview.js';
import isLoggedIn from '../Middlewares/isLoggedIn.js';
import isOwner from '../Middlewares/isOwner.js';
import isReviewAuthor from '../Middlewares/isReviewAuthor.js';
import upload from '../Middlewares/upload.js';

const router = express.Router();

router.get('/', wrapAsync(getAllListings));
router.get('/new', isLoggedIn, wrapAsync(postTheListning));
router.get('/:id', wrapAsync(getAllListingsById));
router.post('/', isLoggedIn, upload.array('listing[images]', 5), validateListing, wrapAsync(postingNewListing));
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(editTheListing));
router.put('/:id', isLoggedIn, isOwner, upload.array('listing[images]', 5), validateListing, wrapAsync(putTheChanges));
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(deleteTheListing));
router.patch('/:id/toggle-availability', isLoggedIn, isOwner, wrapAsync(toggleAvailability));
router.patch('/:id/toggle-published', isLoggedIn, isOwner, wrapAsync(togglePublished));
router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(savingReview));
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(deletingReview));

export default router;