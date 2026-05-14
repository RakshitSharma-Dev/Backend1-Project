import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";
import ExpressError from "../Middlewares/ExpressError.js";

export const createBooking = async (req, res, next) => {
	if (!req.body.booking) {
		return next(new ExpressError(400, "Invalid booking data!"));
	}

	const listingId = req.params.id || req.body.booking.listing;
	if (!listingId) {
		return next(new ExpressError(400, "Listing id is required!"));
	}

	const listing = await Listing.findById(listingId);
	if (!listing) {
		return next(new ExpressError(404, "Listing not found!"));
	}

	const newBooking = new Booking({
		...req.body.booking,
		listing: listingId,
		user: req.user._id,
	});

	try {
		const paymentUrl = process.env.PAYMENT_URL || "http://localhost:7000/payments";
		const paymentRes = await fetch(paymentUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				amount: newBooking.totalPrice,
				currency: "INR",
				paymentMethod: "card",
				customerName: req.user.firstName || "Guest",
				reference: newBooking._id.toString()
			})
		});

		const paymentData = await paymentRes.json();

		if (!paymentRes.ok || paymentData?.transaction?.status !== "APPROVED") {
			req.flash("error", "Payment declined or failed. Please try again.");
			return res.redirect(`/booking/${listingId}/bookings/new`);
		}

		newBooking.status = "confirmed";
	} catch (error) {
		console.error("Payment Error:", error);
		req.flash("error", "Payment gateway is currently unreachable.");
		return res.redirect(`/booking/${listingId}/bookings/new`);
	}

	await newBooking.save();

	req.flash("success", "Booking and Payment successful!");
	res.redirect(`/listing/${listingId}`);
};

export const getBookingForm = async (req, res, next) => {
	const { id } = req.params;

	const listing = await Listing.findById(id);
	if (!listing) {
		req.flash("error", "Listing not found!");
		return res.redirect('/listing');
	}

	res.render('bookings/new.ejs', { listing });
};

export const getMyBookings = async (req, res) => {
	const bookings = await Booking.find({ user: req.user._id })
		.populate("listing")
		.sort({ createdAt: -1 });

	res.status(200).json({ bookings });
};

export const getBookingById = async (req, res, next) => {
	const { bookingId } = req.params;

	const booking = await Booking.findById(bookingId)
		.populate("listing")
		.populate("user", "firstName lastName username email");

	if (!booking) {
		return next(new ExpressError(404, "Booking not found!"));
	}

	if (booking.user._id.toString() !== req.user._id.toString()) {
		return next(new ExpressError(403, "You are not authorized to access this booking!"));
	}

	res.status(200).json({ booking });
};

export const cancelBooking = async (req, res, next) => {
	const { bookingId } = req.params;

	const booking = await Booking.findById(bookingId);
	if (!booking) {
		return next(new ExpressError(404, "Booking not found!"));
	}

	if (booking.user.toString() !== req.user._id.toString()) {
		return next(new ExpressError(403, "You are not authorized to cancel this booking!"));
	}

	booking.status = "cancelled";
	await booking.save();

	req.flash("success", "Booking cancelled successfully!");
	res.redirect("/profile");
};

export const deleteBooking = async (req, res, next) => {
	const { bookingId } = req.params;

	const booking = await Booking.findById(bookingId);
	if (!booking) {
		return next(new ExpressError(404, "Booking not found!"));
	}

	if (booking.user.toString() !== req.user._id.toString()) {
		return next(new ExpressError(403, "You are not authorized to delete this booking!"));
	}

	await Booking.findByIdAndDelete(bookingId);

	req.flash("success", "Booking deleted successfully!");
	res.redirect("/profile");
};
