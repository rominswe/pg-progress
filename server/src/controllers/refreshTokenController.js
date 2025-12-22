import { refreshToken  } from "../config/config.js";

// Get all refresh tokens
export const getAllRefreshTokens = async (req, res) => {
  try {
    const tokens = await refreshToken.findAll();
    res.json({ status: "success", tokens });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Revoke a token
export const revokeRefreshToken = async (req, res) => {
  try {
    const token = await refreshToken.findByPk(req.params.tokenId);
    if (!token) return res.status(404).json({ status: "error", message: "Token not found" });
    await token.destroy();
    res.json({ status: "success", message: "Token revoked successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
