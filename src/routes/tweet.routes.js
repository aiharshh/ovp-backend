import { Router } from "express";
import {
    createTweet
} from "../controllers/tweet.controller.js"


const router = Router();

router.route("")
    .post("/createTweet")


export default router;