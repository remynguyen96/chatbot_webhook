const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');

module.exports = (app) => {
  const logDirectory = path.join(__dirname, 'logs');
  // ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  // create a rotating write stream
  const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  });
  app.set('port', (process.env.PORT || 4500));
  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  
  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, 'public'));
};



