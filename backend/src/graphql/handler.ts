import { createHandler } from "graphql-http/lib/use/express";
import { buildGraphQLContext, type GraphQLContext } from "./context.js";
import { storeGraphQLResolvers, storeGraphQLSchema } from "./storeSchema.ts";

export const storeGraphQLHandler = createHandler<GraphQLContext>({
  schema: storeGraphQLSchema,
  rootValue: storeGraphQLResolvers,
  context: async (req) => buildGraphQLContext(req.raw),
});
