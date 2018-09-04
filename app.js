require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 4500));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN_PAGE = process.env.TOKEN_PAGE;

// curl -X GET "localhost:4500/webhook?hub.verify_token=webhook_verify_successful&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
// curl -H "Content-Type: application/json" -X POST "localhost:4500/webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <div style="padding-top: 35px; text-align: center; font-size: 24px">
      <h3>Welcome To ChatBot For Fanpage <a style="text-decoration: none; color: #53FF92; font-size: 26px" href="https://www.facebook.com/websiteofme/" target="_blank">Websiteofme</a></h3>
    </div>
  `);
});


app.post('/webhook', (req, res) => {
  const { body: { object, entry } } = req;
  if (object === 'page') {
    entry.forEach(entry => {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      const { messaging } = entry;
      const webhook_event = messaging[0];
      console.log(webhook_event, 'webhook_event');

      // Get the sender PSID
      const { sender } = webhook_event;
      const { id } = sender;
      console.log(`Sender PSID: ${id}`);
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(app.get('port'), () => {
  console.log('Servering running on port', app.get('port'));
});
