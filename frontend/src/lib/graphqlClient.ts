export interface GraphQLFormattedError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLFormattedError[];
}

export class GraphQLRequestError extends Error {
  public readonly errors: GraphQLFormattedError[];

  constructor(message: string, errors: GraphQLFormattedError[]) {
    super(message);
    this.name = "GraphQLRequestError";
    this.errors = errors;
  }
}

const getGraphQLEndpoint = (): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl) {
    return `${backendUrl}/api/v1/graphql`;
  }
  return "/api/v1/graphql";
};

export async function graphqlRequest<
  TData,
  TVariables = Record<string, unknown>,
>(query: string, variables?: TVariables): Promise<TData> {
  const response = await fetch(getGraphQLEndpoint(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  let payload: GraphQLResponse<TData>;
  try {
    payload = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new Error("Invalid response received from GraphQL API");
  }

  if (!response.ok || payload.errors?.length) {
    const errors = payload.errors ?? [
      {
        message: `GraphQL request failed with status ${response.status}`,
      },
    ];

    throw new GraphQLRequestError(
      errors[0]?.message || "GraphQL request failed",
      errors,
    );
  }

  if (payload.data === undefined) {
    throw new Error("No data returned from GraphQL API");
  }

  return payload.data;
}
