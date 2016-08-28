var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'socialize_bot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        /*if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }*/
        if (event.message && event.message.text) {
                sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        } else if (event.postback) {
            mainMenu(event.sender.id, event.postback.payload);
            sayThanks(event.sender.id, event.postback.payload);
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function getUserInfo(recipientId){
  var userInfo = null;
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    console.log(body);
    console.log(response);
    userInfo = body;
  });
  return userInfo;
}

function mainMenu(recipientId, rtext){
    if(rtext == 'SOCIALIZE_VA_STARTER'){
      $userInfo = getUserInfo(recipientId);
      message = {
          "attachment": {
              "type": "template",
              "payload":{
              "template_type":"generic",
              "elements":[
                {
                  "title":"Hi",
                  "subtitle":"We\'ve got the right hat for everyone.",
                  "buttons":[
                    {
                      "type":"postback",
                      "title":"Request a Quote",
                      "payload":"request_a_quote"
                    },
                    {
                      "type":"postback",
                      "title":"Build me a Bot",
                      "payload":"build_me_a_bot"
                    },
                    {
                      "type":"postback",
                      "title":"Something Else",
                      "payload":"somethine_else"
                    },
                  ]
                }
              ]
            }
          }
      };
      sendMessage(recipientId, message);
    }
}
function sayThanks(recipientId, rtext){
  if(rtext == 'I like this'){
    message = {text : "Super, Thanks for that. Someone will be in touch with you real soon to discuss with you. What else can i help you with today?"};
    sendMessage(recipientId, message);
  }
}
