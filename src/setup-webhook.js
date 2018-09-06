const request = require('request');

const urlService = 'https://graph.facebook.com/v3.0/me/messages';

const callSendAPI = (sender_psid, response) => {
  // Send the HTTP request to the Messenger Platform
  request({
    uri: urlService,
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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
      console.log('Message sent!');
    }
  });
};

// Handles messages events
const handleMessage = (sender_psid, received_message) => {
  let response;
  // Check if the message contains text
  const { text, attachments } = received_message;
  if (text) {
    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${text}". Now send me an image!`
    };
  } else if (attachments) {
    // Gets the URL of the message attachment
    let attachment_url = attachments[0].payload.url;
    console.log(attachments[0], 'attachments');
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
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
  }
  // Sends the response message
  callSendAPI(sender_psid, response);
};

// Handles messaging_postbacks events
const handlePostback = (sender_psid, received_postback) => {
  let response;
  // Get the payload for the postback
  const { payload } = received_postback;
  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { text: "Thanks!" };
  } else if (payload === 'no') {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
};

module.exports = {
  handleMessage,
  handlePostback,
};

