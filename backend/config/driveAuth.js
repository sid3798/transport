/////////////////////////////////////// for local development use ////////////////////// start


// const fs = require("fs");
// const path = require("path");
// const { google } = require("googleapis");

// async function authorize() {

//   let credentials;

//   if (process.env.GOOGLE_OAUTH) {

//     // Production (Render)
//     credentials = JSON.parse(process.env.GOOGLE_OAUTH);

//   } else {

//     // Local development
//     const filePath = path.join(__dirname, "google-oauth.json");
//     credentials = JSON.parse(fs.readFileSync(filePath));

//   }

//   const { client_secret, client_id, redirect_uris } = credentials.installed;

//   const oAuth2Client = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     redirect_uris[0]
//   );

//   const tokenPath = path.join(__dirname, "token.json");

//   const token = JSON.parse(fs.readFileSync(tokenPath));

//   oAuth2Client.setCredentials(token);

//   return oAuth2Client;
// }

// module.exports = authorize;


/////////////////////////////////// for local development use //////////////////////



//////////////////////////////////for prod use //////////////////////

const { google } = require("googleapis");

async function authorize() {

  const token = JSON.parse(process.env.GOOGLE_TOKEN);

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

module.exports = authorize;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////