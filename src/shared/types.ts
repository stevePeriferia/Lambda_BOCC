export interface ApiGatewayEvent {
  rawPath?: string;
  path?: string;
  httpMethod?: string;
  requestContext?: {
    http?: {
      method: string;
    };
  };
  pathParameters?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string;
}

export interface ApiGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}
