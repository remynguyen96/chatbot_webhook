require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const { version } = require('./package');
const app = express();

app.set('port', (process.env.PORT || 4500));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN_PAGE = process.env.TOKEN_PAGE;

// curl -X GET "localhost:4500/webhook?hub.verify_token=webhook_verify_token&hub.challenge=CHALLENGE_ACCEPTED"

app.get('/', (req, res) => {
  console.log(`Version current: ${version}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/webhook', (req, res) => {
  const { body: { object, entry } } = req;
  if (object === 'page') {
    entry.forEach(entry => {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      const { messaging } = entry;
      const webhook_event = messaging[0];
      
      const { sender, message, postback } = webhook_event;
      
      // Get the sender PSID
      const { id: sender_psid } = sender;
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (message) {
        handleMessage(sender_psid, message);
      } else if (postback) {
        handlePostback(sender_psid, postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).send('Error, wrong validation token');
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    };
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
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
          }]
        }
      }
    };
  }
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;
  
  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" };
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };
  
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

app.listen(app.get('port'), () => {
  console.log('Servering running on port', app.get('port'));
});
