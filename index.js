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
                      qnIndexFixed++;
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
              somethingElse(event.sender.id, event.postback.payload);
              hireUs(event.sender.id, event.postback.payload);
              ourClients(event.sender.id, event.postback.payload);
              caseStudies(event.sender.id, event.postback.payload);
              joinUs(event.sender.id, event.postback.payload);
              meetTheTeam(event.sender.id, event.postback.payload);
              openPositions(event.sender.id, event.postback.payload);
              allTheNews(event.sender.id, event.postback.payload);
              socializeWins(event.sender.id, event.postback.payload);
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
                      "payload":"something_else"
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
    "text" : "So you want a bot just like me. Flattered! Lets take down a few details so we can get started! What is the name of your brand?"
  }
  sendMessage(recipientId, message);

}

function sendQuoteFormSMWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    if(response){
      body = JSON.parse(body);
      var message = {
        "text" : "So you're interested in Social Media Management "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail. What is the name of your brand?"
      }
      sendMessage(recipientId, message);

    }
  });
}

function sendQuoteFormMBWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
  if(response){
      body = JSON.parse(body);
      var message = {
        "text" : "So you're interested in Digital Media Buying "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail. What is the name of your brand?"
      }
      sendMessage(recipientId, message);

  }
  });
}

function sendQuoteFormWDDWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
  if(response){
      body = JSON.parse(body);
      var message = {
        "text" : "So you're interested in a new website "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail. What is the name of your brand?"
      }
      sendMessage(recipientId, message);

    }
  });
}

function sendQuoteFormAllWelcome(recipientId){
  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    if(response){
      body = JSON.parse(body);
      var message = {
        "text" : "So you need a full strategy then, "+body.first_name+". Lets take down a few details so a team member can get in touch with you to discuss in more detail. What is the name of your brand?"
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
  qns.push("Thanks can you tell me where you are located?");
  qns.push("Great. Please share your email address with me?");
  qns.push("What is the best phone number to reach you?");
  qns.push("If you want to leave a message for our team then you can add that now!");
  return qns;
}

function askQnForQuote(recipientId,qnIndex){
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
            "title":"Continue",
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

function sendSomethingElseMenu(recipientId){

  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var welcomeText = "Hi "+body.first_name+" ";
    welcomeText += "So you are looking for something else. Choose from the below!";
    var message = {
        "attachment": {
            "type": "template",
            "payload":{
              "template_type":"button",
              "text" : welcomeText,
                  "buttons":[
                    {
                      "type":"postback",
                      "title":"Hire Us",
                      "payload":"hire_us"
                    },
                    {
                      "type":"postback",
                      "title":"Join Us",
                      "payload":"join_us"
                    },
                    {
                      "type":"postback",
                      "title":"All the news",
                      "payload":"all_the_news"
                    }
            ]
          }
        }
    };
    sendMessage(recipientId, message);
  });

}

function somethingElse(recipientId, rtext){
    if(rtext == 'something_else'){
      sendSomethingElseMenu(recipientId);
    }
}

function sendHireUsMenu(recipientId){

  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var welcomeText = "Hi "+body.first_name+" ";
    welcomeText += "If you are looking for the best boutique agency in the region, you are in the right place.";
    var message = {
        "attachment": {
            "type": "template",
            "payload":{
              "template_type":"button",
              "text" : welcomeText,
                  "buttons":[
                    {
                      "type":"postback",
                      "title":"Our Services",
                      "payload":"other_services"
                    },
                    {
                      "type":"postback",
                      "title":"Our Clients",
                      "payload":"our_clients"
                    },
                    {
                      "type":"postback",
                      "title":"Case Studies",
                      "payload":"case_studies"
                    }
            ]
          }
        }
    };
    sendMessage(recipientId, message);
  });

}

function hireUs(recipientId, rtext){
    if(rtext == 'hire_us'){
      sendHireUsMenu(recipientId);
    }
}

function sendOurClientsMenu(recipientId){


  var  welcomeText = "We are so proud to call this bunch our clients!";
    var message = {
        "attachment": {
            "type": "template",
            "payload":{
              "template_type":"generic",
              "elements":[
                {
                  "title":welcomeText,
                  "image_url":"https://dl.dropboxusercontent.com/u/1312609/clients.png",

                  "buttons":[
                    {
                      "type":"postback",
                      "title":"Case Studies",
                      "payload":"case_studies"
                    },
                    {
                      "type":"postback",
                      "title":"Our Services",
                      "payload":"other_services"
                    }
                  ]
                }
              ]
            }
        }
    };
    sendMessage(recipientId, message);


}

function ourClients(recipientId, rtext){
    if(rtext == 'our_clients'){
      sendOurClientsMenu(recipientId);
    }
}


function sendCaseStudiesMenu(recipientId){
  var headerText = {
    "text" : "Want to see our awesome work?  Check out our case studies below"
  }
  sendMessage(recipientId, headerText);
  var message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements" : [
          {
            "title":"Mercedes Case Study",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"other_services"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"Tip And Toes Case Study",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"other_services"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"Switz Case Study ",
            "buttons":[
              {
                "type":"postback",
                "title":"Request A Quote",
                "payload":"other_services"
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

function caseStudies(recipientId, rtext){
    if(rtext == 'case_studies'){
      sendCaseStudiesMenu(recipientId);
    }
}


function sendJoinUsMenu(recipientId){

  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var welcomeText = "Hi "+body.first_name+" ";
    welcomeText += "Interested in joining out team? Find out more about us here";
    var message = {
        "attachment": {
            "type": "template",
            "payload":{
              "template_type":"button",
              "text" : welcomeText,
                  "buttons":[
                    {
                      "type":"postback",
                      "title":"Open Positons",
                      "payload":"open_positions"
                    },
                    {
                      "type":"postback",
                      "title":"Meet the Team ",
                      "payload":"meet_the_team"
                    },
                    {
                      "type":"postback",
                      "title":"Something Else",
                      "payload":"something_else"
                    }
            ]
          }
        }
    };
    sendMessage(recipientId, message);
  });

}

function joinUs(recipientId, rtext){
    if(rtext == 'join_us'){
      sendJoinUsMenu(recipientId);
    }
}


function sendMeetTheTeamMenu(recipientId){
  var headerText = {
    "text" : "So, you've heard about our awesome team! Meet our talented directors.."
  }
  sendMessage(recipientId, headerText);
  var message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements" : [
          {
            "title":"Akanksha",
            "subtitle": "Managing Director",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://www.linkedin.com",
                "title":"Connect On Linkedin"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"Leah",
            "subtitle": "Account Director",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://www.linkedin.com",
                "title":"Connect On Linkedin"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },
          {
            "title":"Aurelian",
            "subtitle": "Account Director",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://www.linkedin.com",
                "title":"Connect On Linkedin"
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

function meetTheTeam(recipientId, rtext){
    if(rtext == 'meet_the_team'){
      sendMeetTheTeamMenu(recipientId);
    }
}


function sendOpenPositionsMenu(recipientId){
  var headerText = {
    "text" : "We have some super exciting positions. Take a look and send us your CV."
  }
  sendMessage(recipientId, headerText);
  var message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements" : [
          {
            "title":"Account Manager",
            "subtitle": "Dubai",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://socialize.bamboohr.co.uk/jobs/",
                "title":"Apply Now"
              },
              {
                "type":"postback",
                "title":"Meet the Team",
                "payload":"meet_the_team"
              }
            ]
          },{
            "title":"Digital Media Planner Manager",
            "subtitle": "Dubai",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://socialize.bamboohr.co.uk/jobs/",
                "title":"Apply Now"
              },
              {
                "type":"postback",
                "title":"Meet the Team",
                "payload":"meet_the_team"
              }
            ]
          },
          {
            "title":"Creative Designer",
            "subtitle": "Dubai",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://socialize.bamboohr.co.uk/jobs/",
                "title":"Apply Now"
              },
              {
                "type":"postback",
                "title":"Meet the Team",
                "payload":"meet_the_team"
              }
            ]
          }
        ]
      }
    }
  };
  sendMessage(recipientId, message);
}

function openPositions(recipientId, rtext){
    if(rtext == 'open_positions'){
      sendOpenPositionsMenu(recipientId);
    }
}


function sendAllTheNewsMenu(recipientId){

  request("https://graph.facebook.com/v2.6/"+recipientId+"?access_token="+process.env.PAGE_ACCESS_TOKEN, function(error, response, body) {
    body = JSON.parse(body);
    var welcomeText = "Hi "+body.first_name+" ";
    welcomeText += "We got news covered from Socialize headlines to industry updates. You can choose an option below to receive alerts about us";
    var message = {
        "attachment": {
            "type": "template",
            "payload":{
              "template_type":"button",
              "text" : welcomeText,
                  "buttons":[
                    {
                      "type":"postback",
                      "title":"Industry News",
                      "payload":"industry_news"
                    },
                    {
                      "type":"postback",
                      "title":"Socialize Wins",
                      "payload":"socialize_wins"
                    },
                    {
                      "type":"postback",
                      "title":"Socialize Instagram",
                      "payload":"socialize_instagram"
                    }
            ]
          }
        }
    };
    sendMessage(recipientId, message);
  });

}

function allTheNews(recipientId, rtext){
    if(rtext == 'all_the_news'){
      sendAllTheNewsMenu(recipientId);
    }
}


function sendSocializeWinsMenu(recipientId){
  var headerText = {
    "text" : "We like winning and are super proud that 2016 has already proved to be a year of big wins"
  }
  sendMessage(recipientId, headerText);
  var message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements" : [
          {
            "title":"#Socializewins",
            "subtitle": "General Mills",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://communicateonline.me/agency/general-mills-awards-entire-portfolio-to-socialize/",
                "title":"Link to Communicate"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          },{
            "title":"#Socializewins",
            "subtitle": "Kay Skin Clinic",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://communicateonline.me/agency/scialize-wins-kaya-skincare-account/",
                "title":"Link to Communicate"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          }{
            "title":"#Socializewins",
            "subtitle": "Betty Crocker",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://communicateonline.me/agency/socialize-wins-betty-crocker-account/",
                "title":"Link to Communicate"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          }{
            "title":"#Socializewins",
            "subtitle": "Auto Desk",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://www.socializeagency.com/case-studies/monopoly-at-the-mall",
                "title":"Link to Communicate"
              },
              {
                "type":"postback",
                "title":"Main Menu",
                "payload":"SOCIALIZE_VA_STARTER"
              }
            ]
          }{
            "title":"#Socializewins",
            "subtitle": "Shukran",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://www.socializeagency.com/case-studies/monopoly-at-the-mall",
                "title":"Link to Communicate"
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

function socializeWins(recipientId, rtext){
    if(rtext == 'socialize_wins'){
      sendSocializeWinsMenu(recipientId);
    }
}
