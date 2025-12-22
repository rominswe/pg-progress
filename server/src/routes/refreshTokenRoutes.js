import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getAllRefreshTokens,
  revokeRefreshToken
} from "../controllers/refreshTokenController.js";

const router = express.Router();

// Admin-only access for token management
router.get("/", protect(["CGSADM", "EXCGS"]), getAllRefreshTokens);
router.delete("/:tokenId", protect(["CGSADM", "EXCGS"]), revokeRefreshToken);

export default router;