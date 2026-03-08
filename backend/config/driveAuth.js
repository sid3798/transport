const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
//const open = require("open").default;

const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "google-oauth.json");

async function authorize() {
 const credentials = JSON.parse(process.env.GOOGLE_OAUTH_JSON);
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  //await open(authUrl);

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    readline.question("Enter the code from that page here: ", resolve);
  });

  readline.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  return oAuth2Client;
}

module.exports = authorize;