## Facebook Messenger Bot Demo
-  The webhooks for FB Messenger bot is defined using NodeJS [index.js

- FB Page access token is defined in Heroku [https://dashboard.heroku.com/apps/socializevirtualassistant/settings]


### Below are one time subscription done as per fb documentation 


##### App subcription call
- curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=ACCESS_TOKEN”

##### Thread Settings Enabler
-  curl -X POST "https://graph.facebook.com/v2.6/me/thread_settings?access_token=ACCESS_TOKEN”

##### GET Started button is defined using below call
``` curl -X POST -H "Content-Type: application/json" -d '{
  "setting_type":"call_to_actions",
  "thread_state":"new_thread",
  "call_to_actions":[
    {
      "payload":"USER_DEFINED_PAYLOAD"
    }
  ]
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=ACCESS_TOKEN”
```
