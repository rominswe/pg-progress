import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getAllRefreshTokens,
  revokeRefreshToken
} from "../controllers/refreshTokenController.js";
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Admin-only access for token management
router.get("/", protect, requireRole("CGSADM"), getAllRefreshTokens);
router.delete("/:tokenId", protect, requireRole("CGSADM"), revokeRefreshToken);

export default router;