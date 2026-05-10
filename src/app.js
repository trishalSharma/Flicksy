import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.get("/", (req, res) => {
    res.send("API Working");
});

app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true
}));

// configurations 
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import 
import userRouter from './routes/user.routes.js';

// routes
app.use("/api/v1/users", userRouter);

export { app };