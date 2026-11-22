import { Router } from "express";
import {
    addComment,

} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();



export default router;