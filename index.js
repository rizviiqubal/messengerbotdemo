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
            console.log(JSON.stringify(event.message));
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
              otherServices(event.sender.id, event.postback.payload);
              buildMeABot(event.sender.id, event.postback.payload);
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
            console.log('Error: ', response.body);
        }
    });
};

function sendMainMenu(recipientId){

  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var welcomeText = "Hi "+body.first_name+" ";
    welcomeText += "Welcome to Socialize virtual assistant.";
    welcomeText += "How can i help you today?";
    var message = {
        "attachment": {
            "type": "template",
            "payload":{
              "template_type":"button",
              "text" : welcomeText,
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
                    }
            ]
          }
        }
    };
    sendMessage(recipientId, message);
  });

}

function mainMenu(recipientId, rtext){
    if(rtext == 'SOCIALIZE_VA_STARTER'){
      sendMainMenu(recipientId);
    }
}

function sendRequestAQuoteMenu(recipientId){
  var headText = "Great , as a full service digital agency, ";
  headText += " we have a few services you can choose from.";
  headText += " You can even have a bot just like me :-)";

      var message = {
          "attachment": {
              "type": "template",
              "payload":{
              "template_type":"button",
              "text" : headText,
              "buttons":[
                  {
                      "type":"postback",
                      "title":"I want a bot like you",
                      "payload":"build_me_a_bot"
                  },
                  {
                      "type":"postback",
                      "title":"Other Services",
                      "payload":"other_services"
                  },
                ]
            }
          }
      };
      sendMessage(recipientId, message);
}

function requestAQuote(recipientId, rtext){
    if(rtext == 'request_a_quote'){
        sendRequestAQuoteMenu(recipientId)
    }
}

function sendOtherServicesMenu(recipientId){
  var headerText = {
    "text" : "Socialize offers a full range of digital services. See what we offer below."
  }
  sendMessage(recipientId, headerText);
  var message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements" : [
          {
            "title":"Social Media Management",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"request_a_quote_sm"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"Media Buying",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"request_a_quote_mb"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"Website Design And Development",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"request_a_quote_wdd"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"I want it all",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"request_a_quote_all"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          }
        ]
      }
    }
  };
  sendMessage(recipientId, message);
}

function otherServices(recipientId, rtext){
    if(rtext == 'other_services'){
      sendOtherServicesMenu(recipientId);
    }
}

function sendBuildMeABotMenu(recipientId){
  var message = {
    "text" : "So you want a bot just like me. Flattered! Lets take down a few details so we can get started!"
  }
  sendMessage(recipientId, message);
  //sendQuoteForm(recipientId);
}

function buildMeABot(recipientId, rtext){
    if(rtext == 'build_me_a_bot'){
      sendBuildMeABotMenu(recipientId);
    }
}

function sendQuoteForm(recipientId){
  var message = {
    "text" : "What is the name of your brand?"
  }
  sendMessage(recipientId, message);

  var message = {
    "text" : "Thanks can you tell me where you are located?"
  }
  sendMessage(recipientId, message);

  var message = {
    "text" : "Great. Please share your email address with me?"
  }
  sendMessage(recipientId, message);

  var message = {
    "text" : "What is the best phone number to reach you?"
  }
  sendMessage(recipientId, message);

  var message = {
    "text" : "if you want to leave a message for our team then you can add that now!"
  }
  sendMessage(recipientId, message);
}
