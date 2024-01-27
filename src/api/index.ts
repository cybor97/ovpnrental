import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import internal from "./internal";
import logger from "../utils/logger";
import { inspect } from "util";

export function getApi() {
  const app = express();

  app.use(internal);

  app.use(((
    err: Error,
    _req: Request,
    res: Response,
    _next: () => NextFunction
  ) => {
    logger.error(`[api] Unexpected error ${err.message} ${inspect(err)}`);
    res.status(500).send("Unknown error");
  }) as ErrorRequestHandler);

  return app;
}
