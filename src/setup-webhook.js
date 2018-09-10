const request = require('request');
const fetch = require('node-fetch');
const utf8 = require('utf8');

const urlService = 'https://graph.facebook.com/v3.0/me/messages';
const apiTranslate = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
const { PAGE_ACCESS_TOKEN, KEY_TRANSLATE } = process.env;

const translateApi = async (text) => {
  try {
    const encodeText = utf8.encode(text);
    const url = `${apiTranslate}?key=${KEY_TRANSLATE}&text=${encodeText}&lang=vi-en`;
    const getTranslate = await fetch(url);
    const parseTranslateApi = await getTranslate.json();
    const jsonResult = await parseTranslateApi;
    return jsonResult;
  } catch (error) {
    console.error(`Unable to send message: ${error}`);
  }
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

const handleReceiveText = async (messages) => {
  const { text } = await translateApi(messages);
  if (Array.isArray(text)) {
    const encodeMessage = utf8.encode(text[0]);
    return {
      text: encodeMessage
    };
  }
  return {
    text: `I can't translate ${message}. I really sorry about that!`
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
const handleMessage = async (sender_psid, message) => {
  let response;
  const { text, attachments } = message;
  if (text) {
    response = await handleReceiveText(text);
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

