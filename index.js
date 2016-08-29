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

          if (event.message && event.message.text) {
            if(event.message.is_echo){
              console.log("Message is echo");
              //continue;
            }
                  //sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
          }
          if (event.postback && event.postback.payload) {
              console.log("Has Postback:"+JSON.stringify(event.postback));
              mainMenu(event.sender.id, event.postback.payload);
              requestAQuote(event.sender.id, event.postback.payload);
          }

    }
    res.sendStatus(200);
});

function sendWelcomeMessage(recipientId,message){

  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    console.log("Inside Request: recver first name"+body.first_name);
    var welcomeText = "Hi "+body.first_name+" ";
    welcomeText += "Welcome to Socialize virtual assistant.";
    welcomeText += "How can i help you today?";
    message = {
                "text": welcomeText
              };
      sendMessage(recipientId, message);
  });

}

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





function mainMenu(recipientId, rtext){
    if(rtext == 'SOCIALIZE_VA_STARTER'){

      sendWelcomeMessage(recipientId);
      message = {
          "attachment": {
              "type": "template",
              "payload":{
              "template_type":"generic",
              "elements":[
                {
                  "title" : "Welcome",
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

function requestAQuote(recipientId, rtext){
    if(rtext == 'request_a_quote'){

        var welcomeText = "Great , as a full service digital agency, ";
        welcomeText += " we have a few services you can choose from.";
        welcomeText += " You can even have a bot just like me :-)";
        message = {
                  	"text": welcomeText
                  }
        sendMessage(recipientId, message);


      message = {
          "attachment": {
              "type": "template",
              "payload":{
              "template_type":"generic",
              "elements":[
                {
                  "title" : "Request a Quote",
                  "buttons":[
                    {
                      "type":"postback",
                      "title":"I want a bot like you",
                      "payload":"bot_like_you"
                    },
                    {
                      "type":"postback",
                      "title":"Other Services",
                      "payload":"other_services"
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
