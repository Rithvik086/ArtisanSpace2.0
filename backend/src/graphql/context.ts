import type { Request } from "express";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { userExists } from "../services/userServices.js";
import logger from "../utils/logger.js";

export interface AuthUser {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export type GraphQLContext = Record<PropertyKey, unknown> & {
  req: Request;
  user: AuthUser | null;
  requireAuth: () => AuthUser;
};

const getAuthUserFromRequest = async (req: Request): Promise<AuthUser | null> => {
  const token = (req.cookies as Record<string, string | undefined> | undefined)
    ?.token;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthUser;

    if (!decoded?.id || !decoded?.role) {
      return null;
    }

    const exists = await userExists(decoded.id);
    if (!exists) {
      return null;
    }

    return decoded;
  } catch (error) {
    logger.debug(
      { error: (error as Error).message },
      "GraphQL token validation failed",
    );
    return null;
  }
};

export const buildGraphQLContext = async (
  req: Request,
): Promise<GraphQLContext> => {
  const user = await getAuthUserFromRequest(req);

  return {
    req,
    user,
    requireAuth: () => {
      if (!user) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return user;
    },
  };
};
