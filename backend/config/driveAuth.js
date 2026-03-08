const { google } = require("googleapis");

async function authorize() {

  const token = JSON.parse(process.env.GOOGLE_TOKEN);

  const oAuth2Client = new google.auth.OAuth2();

  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

module.exports = authorize;