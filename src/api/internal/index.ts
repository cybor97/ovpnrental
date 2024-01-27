import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import logger from "../../utils/logger";
import { getServers } from "./getServers";

const router = Router();

router.use((req, res, next) => {
  try {
    const jwtData = jwt.verify(
      req.headers.authorization as string,
      config.api.internalJwtSecret
    ) as JwtPayload;
    logger.info(`[Internal] ${req.method} ${req.path} (${jwtData.app})`);
    next();
  } catch (e) {
    res.status(401).send("Unauthorized");
    return;
  }
});

router.get("/internal/servers", getServers);

export default router;
