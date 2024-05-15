import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";

function generateAuthResponse(
  principalId: string,
  effect: string,
  resource: string
): APIGatewayAuthorizerResult {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  return authResponse;
}

export const basicAuthorizer = async (
  event: APIGatewayRequestAuthorizerEvent
) => {
  console.log("event: ", event);

  const authHeader = event.headers?.Authorization;

  if (authHeader === undefined)
    return generateAuthResponse("user123", "Deny", event.methodArn);

  try {
    const [login, pass] = atob(authHeader.split(" ")[1]).split(":");

    const isAllowed = process.env[login] === pass;

    if (isAllowed)
      return generateAuthResponse("user123", "Allow", event.methodArn);
  } catch (e) {
    return generateAuthResponse("user123", "Deny", event.methodArn);
  }

  return generateAuthResponse("user123", "Deny", event.methodArn);
};
