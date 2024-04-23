const token = "Basic TWF0dmllbjpURVNUX1BBU1NXT1JE";

try {
  const [login, pass] = atob(token.split(" ")[1]).split(":");

  const isAllowed = process.env[login] === pass;

  console.log(login, pass, isAllowed);
} catch (e) {
  console.log("error: ", e);
}
