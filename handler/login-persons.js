'use strict';
const AWS = require('aws-sdk');
const loopback = require('loopback');
const boot = require('loopback-boot');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const localconfig = require('../configurations/local.config.json')

const app = module.exports = loopback();


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const CONFIG_PERSONS_TABLE = process.env.CONFIG_PERSONS_TABLE;
const CONFIG_PERSONS_DYNAMODB_ENDPOINT = process.env.CONFIG_DYNAMODB_ENDPOINT;
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;

if (IS_OFFLINE === 'true') {

  dynamoDb = new AWS.DynamoDB.DocumentClient(localconfig)

} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.get('/persons', async function(req, res) {

  const dbParams = {
    TableName: CONFIG_PERSONS_TABLE,
  };

  let result = await dynamoDb.scan(dbParams).promise();
  res.json({persons: result.Items});
});



// INstantiating the express-jwt middleware
const jwtMW = exjwt({
  secret: 'keyboard cat 4 ever'
});

/**
 * add a new person with some predefined data
 */
app.post('/persons', async function(req, res) {

  const dbParams = {
    TableName: CONFIG_PERSONS_TABLE,
    Item: {
      personId: ''+new Date().getTime(),
      username: req.body.username,
      password: req.body.password
    },
  };

  try {
    await dynamoDb.put(dbParams).promise();
    res.json({status: '200'});
  } catch (error) {
    console.log(error);
    res.status(400).json({error: 'error writing person'});
  }
});




// LOGIN ROUTE
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const dbParams = {
    TableName: CONFIG_PERSONS_TABLE,
  };
   
   dynamoDb.scan(dbParams, function(err, users) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(users.Items)
  
      
      for (let user of users.Items) { 
        if (username == user.username && password == user.password /* Use your password hash checking logic here !*/) {
            //If all credentials are correct do this
            let token = jwt.sign({ id: user.id, username: user.username }, 'keyboard cat 4 ever', { expiresIn: 129600 }); // Sigining the token
            res.json({
                sucess: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                sucess: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
    }
  });
  // Use your DB ORM logic here to find user and compare password

});

app.get('/content', jwtMW /* Using the express jwt MW here */, (req, res) => {
  res.send('You are authenticated'); //Sending some response when authenticated
});

// Error handling 
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') { // Send the error rather than to show it on the console
      res.status(401).send(err);
  }
  else {
      next(err);
  }
});


module.exports.handler = serverless(app);