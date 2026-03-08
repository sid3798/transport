const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const TOKEN_PATH = path.join(__dirname, "token.json");

async function authorize() {

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));

  const oAuth2Client = new google.auth.OAuth2();

  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

module.exports = authorize;