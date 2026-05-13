import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './DB/db.js';
import listinRoutes from './Routes/listing.route.js';
import userRoutes from './Routes/user.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import ExpressError from './Middlewares/ExpressError.js';
import session from 'express-session';
import flash from 'connect-flash';
import { flashMiddleware } from './Middlewares/flash.middleware.js';
import passport from 'passport';
import User from './models/user.model.js';
import bookingRoutes from './Routes/booking.route.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import MongoStore from 'connect-mongo';

dotenv.config();

const require = createRequire(import.meta.url);
const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        touchAfter: 24 * 60 * 60,
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flashMiddleware);

const listingViewers = {};

io.on('connection', (socket) => {
    socket.on('joinListing', (listingId) => {
        socket.join(listingId);
        socket.currentListing = listingId;
        listingViewers[listingId] = (listingViewers[listingId] || 0) + 1;
        io.to(listingId).emit('viewerCount', listingViewers[listingId]);
    });

    socket.on('disconnect', () => {
        const listingId = socket.currentListing;
        if (listingId && listingViewers[listingId]) {
            listingViewers[listingId] = Math.max(0, listingViewers[listingId] - 1);
            io.to(listingId).emit('viewerCount', listingViewers[listingId]);
        }
    });
});

app.get('/', (req, res) => {
    res.render('home/home.ejs');
});

app.use('/', userRoutes);
app.use('/listing', listinRoutes);
app.use('/booking', bookingRoutes);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render('error.ejs', { statusCode, message });
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`);
});