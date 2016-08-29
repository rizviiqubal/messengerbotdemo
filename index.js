var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var qnIndexFixed = 0;

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
          console.log(JSON.stringify(event));
          if (event.message && event.message.text) {
              console.log(JSON.stringify(event.message.text));
              if(event.message.is_echo){
                console.log("Message is echo");
                console.log(JSON.stringify(event.message.text));
              } else {
                  console.log("Question Index"+qnIndexFixed);
                  var questionArray = getArrayQuoteQuestions();
                  if(qnIndexFixed < questionArray.length){
                      askQnForQuote(event.sender.id,qnIndexFixed);
                  } else {
                      requestQuoteThanks(event.sender.id);
                  }

              }
                  //continue;
            }

          if (event.postback && event.postback.payload) {
              console.log("Has Postback:"+JSON.stringify(event.postback));
              mainMenu(event.sender.id, event.postback.payload);
              requestAQuote(event.sender.id, event.postback.payload);
              otherServices(event.sender.id, event.postback.payload);
              sendQuoteForm(event.sender.id, event.postback.payload);
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
                      "payload":"request_a_quote_bot"
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
                      "payload":"request_a_quote_bot"
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

function sendQuoteFormBuildMeABotWelcome(recipientId){
  var message = {
    "text" : "So you want a bot just like me. Flattered! Lets take down a few details so we can get started!"
  }
  sendMessage(recipientId, message);
  askQnForQuote(recipientId,0);
}

function sendQuoteFormSMWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var message = {
      "text" : "So you're interested in Social Media Management "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail."
    }
    sendMessage(recipientId, message);
    askQnForQuote(recipientId,0);
  });
}

function sendQuoteFormMBWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var message = {
      "text" : "So you're interested in Digital Media Buying "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail."
    }
    sendMessage(recipientId, message);
    askQnForQuote(recipientId,0);
  });
}

function sendQuoteFormWDDWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var message = {
      "text" : "So you're interested in a new website "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail."
    }
    sendMessage(recipientId, message);
    askQnForQuote(recipientId,0);
  });
}

function sendQuoteFormAllWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    if(response){
      askQnForQuote(recipientId,0);
      body = JSON.parse(body);
      var message = {
        "text" : "So you need a full strategy then, "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail."
      }
      sendMessage(recipientId, message);

    }

  });
}

function sendQuoteForm(recipientId, rtext){
  var isQuoteRequested = false;
  if(rtext == 'request_a_quote_bot'){
    sendQuoteFormBuildMeABotWelcome(recipientId);
    isQuoteRequested = true;
  }

  if(rtext == "request_a_quote_sm"){
    sendQuoteFormSMWelcome(recipientId);
    isQuoteRequested = true;
  }

  if(rtext == "request_a_quote_mb"){
    sendQuoteFormMBWelcome(recipientId);
    isQuoteRequested = true;
  }

  if(rtext == "request_a_quote_wdd"){
    sendQuoteFormWDDWelcome(recipientId);
    isQuoteRequested = true;
  }

  if(rtext == "request_a_quote_all"){
    sendQuoteFormAllWelcome(recipientId);
    isQuoteRequested = true;
  }
  if(isQuoteRequested){
    qnIndexFixed = 0;
  }

}

function getArrayQuoteQuestions(){
  var qns = [];
  qns.push("What is the name of your brand?");
  qns.push("Thanks can you tell me where you are located?");
  qns.push("Great. Please share your email address with me?");
  qns.push("What is the best phone number to reach you?");
  qns.push("If you want to leave a message for our team then you can add that now!");
  return qns;
}

function askQnForQuote(recipientId,qnIndex){
  qnIndexFixed++;
  var questionArray = getArrayQuoteQuestions();
  var message = {
    "text" : questionArray[qnIndex]
  }
  sendMessage(recipientId, message);
}

function sendRequestQuoteThanksMenu(recipientId){
  var headerText = {
    "text" : "Super.  Thanks for that.  Someone will be in touch with you real soon to discuss.  What else can I help you with today?"
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
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              },{
                "type":"postback",
                "title":"Case Studies",
                "payload":"case_studies"
              }
            ]
          }
        ]
      }
    }
  };
  sendMessage(recipientId, message);
}

function requestQuoteThanks(recipientId){
      sendRequestQuoteThanksMenu(recipientId);
}
