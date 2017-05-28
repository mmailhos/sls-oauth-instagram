'use strict';

const fs = require('fs');

module.exports.serve_index = (event, context, callback) => {
    return fs.readFile('templates/index.html', 'utf8', function (err,data) {
        if (err) {
          console.log(err);
          callback(null, { statusCode: 500 });
        } else {
          callback(null, { statusCode: 200, headers: { "Content-Type": "text/html" }, body: replaceTemplateVariables(data) });
        }
    });
};

function replaceTemplateVariables(data) {
  data = data.replace("%MAINCSS_URL%", process.env.main_css_url);
  data = data.replace("%MAINJS_URL%", process.env.main_js_url);
  data = data.replace("%INSTAFEED_URL%", process.env.instafeed_js_url);
  data = data.replace("%API_KEY%", process.env.firebase_key);
  data = data.replace("%AUTH_DOMAIN%", process.env.firebase_auth_domain);
  data = data.replace("%DATABASE_URL%", process.env.firebase_database_url);
  data = data.replace("%STORAGE_BUCKET%", process.env.firebase_storage_bucket);
  data = data.replace("%MESSAGING_SENDER_ID%", process.env.firebase_messenger_id);
  return data;
}
