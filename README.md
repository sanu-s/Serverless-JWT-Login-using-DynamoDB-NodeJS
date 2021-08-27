
## Prerequisites

### Configure jave (jre 6.X+)
sudo apt install openjdk-8-jre-headless

### Node packages global
$ npm install -g serverless
$ sls dynamodb install

# Node packages local
$ npm install

## Run
serverless offline start



## Test the APP

* Create a User in persons table by
    POST: `http://localhost:3000/persons`
    REQUEST = `{username: 'test', password: 'test1234'}`



* Check the persons table contents
    GET: `http://localhost:3000/persons`
    RESPONCE = `{Persons:[{username: 'test', password: 'test1234'}]}`



* View Authorized content
    GET: `http://localhost:3000/content`
    RESPONSE: `{"name":"UnauthorizedError","message":"No authorization token was found","code":"credentials_required","status":401,"inner":{"message":"No authorization token was found"}}`



* login into the app
    POST: `http://localhost:3000/persons`
    REQUEST = `{username: 'test', password: 'test1234'}`

    

* Check the url By  setting Authorization  Bearer Token in header
    GET: `http://localhost:3000/content`
    RESPONSE: `You are Authorized`
   





