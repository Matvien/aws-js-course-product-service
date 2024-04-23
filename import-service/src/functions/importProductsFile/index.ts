import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "/import",
        cors: true,
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
        authorizer: {
          type: "request",
          arn: "arn:aws:lambda:eu-central-1:278497268453:function:authorization-service-dev-basicAuthorizer",
          identitySource: "method.request.header.Authorization",
          resultTtlInSeconds: 300,
        },
      },
    },
  ],
};
