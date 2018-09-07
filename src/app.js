require('dotenv').config();
const express = require('express');
const settings = require('./settings');
const { handleMessage, handlePostback } = require('./setup-webhook');
const { version } = require('../../package');

const app = express();

settings(app);
app.get('/', (req, res) => {
  const infomation = {
    title: `Remy Chatbot for messenger ${version}`,
    version,
  };
  res.render('index', infomation);
});

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).send('Error, wrong validation token');
});

app.post('/webhook', (req, res) => {
  const { body: { object, entry } } = req;
  if (object === 'page') {
    entry.forEach(entry => {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      const { messaging } = entry;
      //PSID Get the sender 
      const { sender: { id }, message, postback } = messaging[0];
      // pass the event to the appropriate handler function
      if (message) {
        handleMessage(id, message);
      } else if (postback) {
        handlePostback(id, postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(app.get('port'), () => {
  console.log('Servering running on port', app.get('port'));
});
