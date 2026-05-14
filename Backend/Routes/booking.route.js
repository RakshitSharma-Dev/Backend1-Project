import express from "express";
import {
	createBooking,
	getBookingForm,
	getMyBookings,
	getBookingById,
	cancelBooking,
	deleteBooking,
} from "../Controllers/booking.controller.js";
import wrapAsync from "../Middlewares/wrapAsync.js";
import isLoggedIn from "../Middlewares/isLoggedIn.js";

const router = express.Router();

router.get("/:id/bookings/new", isLoggedIn, wrapAsync(getBookingForm));
router.post("/:id/bookings", isLoggedIn, wrapAsync(createBooking));
router.get("/bookings", isLoggedIn, wrapAsync(getMyBookings));
router.get("/bookings/:bookingId", isLoggedIn, wrapAsync(getBookingById));
router.post("/bookings/:bookingId/cancel", isLoggedIn, wrapAsync(cancelBooking));
router.delete("/bookings/:bookingId", isLoggedIn, wrapAsync(deleteBooking));

export default router;
