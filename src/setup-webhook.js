const request = require('request');

// https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20180907T103104Z.6927e8d673f30e36
//   .78dbb8ebf822b696359b83bc08807aa9dca27e36&text="xin chào&lang=vi-en
const urlService = 'https://graph.facebook.com/v3.0/me/messages';
const apiTranslate = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
const { PAGE_ACCESS_TOKEN, KEY_TRANSLATE } = process.env;

const translateApi = async (text) => {
  const url = `${apiTranslate}?key=${KEY_TRANSLATE}&text=${text}&lang=vi-en`;
  const getTranslate = request.get(url, (error, res, body) => {
    if (error) {
      console.error(`Unable to send message: ${error}`);
    } else if (res.body.error) {
      console.log('Error: ', res.body.error);
    } else {
      console.log(body, 'body.text');
    }
  });
  return getTranslate;
};

const callSendAPI = (sender_psid, response) => {
  // Send the HTTP request to the Messenger Platform
  request({
    uri: urlService,
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: "POST",
    json: {
      recipient: { id: sender_psid },
      message: response,
    }
  }, (err, res, body) => {
    if (err) {
      console.error(`Unable to send message: ${err}`);
    } else if (res.body.error) {
      console.log('Error: ', res.body.error);
    } else {
      console.log(`Message sent to ${body.recipient_id}!`);
    }
  });
};

const handleReceiveText = (text) => {
  const test = translateApi(text);
  console.log(test, 'test');
  return {
    text: "------------------------------------------------------"
  };
};

const handleReceiveFile = (file) => {
  // Gets the URL of the message attachment
  const { url } = file[0].payload;
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          },
          {
            "title": "Second card",
            "subtitle": "Element #2 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
            "buttons": [{
              "type": "postback",
              "title": "Postback",
              "payload": "Payload for second element in a generic bubble",
            }],
          },
        ]
      }
    }
  };
};

// Handles messages events
const handleMessage = (sender_psid, message) => {
  let response;
  const { text, attachments } = message;
  if (text) {
    response = handleReceiveText(text);
  } else if (attachments) {
    response = handleReceiveFile(attachments);
  }
  callSendAPI(sender_psid, response);
};

// Handles messaging_postbacks events
const handlePostback = (sender_psid, postback) => {
  let response;
  const { payload } = postback;
  if (payload === 'yes') {
    response = { text: "Wow, That's a beautiful picture !" };
  } else if (payload === 'no') {
    response = { text: "Sorry, I don't have idea for that" };
  }
  callSendAPI(sender_psid, response);
};

module.exports = {
  handleMessage,
  handlePostback,
};

