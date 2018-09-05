require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const request = require('request');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const { version } = require('./package');

const app = express();
const { PAGE_ACCESS_TOKEN, VERIFY_TOKEN, PORT } = process.env;
const urlService = 'https://graph.facebook.com/v3.0/me/messages';

const logDirectory = path.join(__dirname, 'logs');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});
app.set('port', (PORT || 4500));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public'));

app.get('/', (req, res) => {
  const infomation = {
    title: `Chatbot for messenger ${version}`,
    version,
  };
  res.render('index', infomation);
});

app.post('/webhook', (req, res) => {
  const { body: { object, entry } } = req;
  if (object === 'page') {
    entry.forEach(entry => {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      const { messaging } = entry;
      // Get the sender PSID
      const { sender : { id: sender_psid }, message, postback } = messaging[0];
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
    "uri": urlService,
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
