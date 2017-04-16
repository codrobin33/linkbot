var dbHelper = require('./dbHelper.js');

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bot_token = process.env.SLACK_BOT_TOKEN || '';

// for herkoku to bind to.
var express = require('express')
var app = express()

//var config = require('./config.js');

//var rtm = new RtmClient(config.apiKey);
var rtm = new RtmClient(process.env.APIKEY);

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.text && message.text.includes(`<@${rtm.activeUserId}>`)) {
    // --- HELP ME ---
    if (message.text.toLowerCase().includes('help')) {
      var ret = '```' +
        'Avaliable commands are: \n' +
        'link me {key} \n' +
        'link all \n' +
        'save/add link {key} {link} \n' +
        'remove link {key} \n\n' +

        'Example: \n' +
        '@linkbot save link google https://google.com \n' +
      '```';

      rtm.sendMessage(`<@${message.user}>, ${ret}`, message.channel);
    }

    // --- GET LINK ---
    if (message.text.toLowerCase().includes('link me ')) {
      var link = message.text.toLowerCase().split('link me ')[1];

      dbHelper.get(link, function(result) {
        if (!result) {
          rtm.sendMessage(`<@${message.user}>, error: could not find link`, message.channel);
          return;
        } else if (result.error) {
          rtm.sendMessage(`<@${message.user}>, error: ${result.error}`, message.channel);
          return;
        }

        if (result && typeof result.link !== 'undefined') {
          rtm.sendMessage(`<@${message.user}>, ${result.link}`, message.channel);
        } else {
          rtm.sendMessage(`<@${message.user}>, could not find the link.`, message.channel);
        }
      });

      return;
    }

    // --- GET ALL LINKS ---
    if (message.text.toLowerCase().includes('link all')) {
      dbHelper.getAll(function(links) {
        if (links.error) {
          rtm.sendMessage(`<@${message.user}>, error getting all links`, message.channel);
          return;
        }

        var ret = '```';
        for (var i = 0; i < links.length; i++) {
          var link = links[i];

          ret += `${link.key}: ${link.link} \n`;
        }
        ret += '```';

        rtm.sendMessage(`<@${message.user}>, ${ret}`, message.channel);
      })
    }

    // --- SAVE LINK ---
    if (message.text.toLowerCase().includes('save link ') || message.text.toLowerCase().includes('add link ')) {
      var keyAndLink;
      if (message.text.toLowerCase().includes('save link ')) {
        keyAndLink = message.text.toLowerCase().split('save link ')[1];
      } else {
        keyAndLink = message.text.toLowerCase().split('add link ')[1];
      }

      var parts = keyAndLink.split(' ');

      if (parts.length < 2) {
        rtm.sendMessage(`<@${message.user}>, please enter your link like, facebook https://facebook.com`, message.channel);
        return;
      }
      var key = parts[0];
      var link = parts[1].replace('<', '').replace('>', ''); // slack adds these for some reason

      dbHelper.insert(key, link, function(result) {
        if (result.error) {
          rtm.sendMessage(`<@${message.user}>, error: ${result.error}`, message.channel);
          return;
        }

        rtm.sendMessage(`<@${message.user}>, inserted link ${link} with key ${key}`, message.channel);
      });

      return;
    }

    // --- UPDATE LINK ---

    // --- REMOVE LINK ---
    if (message.text.toLowerCase().includes('remove link ')) {
      var key = message.text.toLowerCase().split('remove link ')[1];

      dbHelper.remove(key, function(result) {
        if (result.error) {
          rtm.sendMessage(`<@${message.user}>, error removing key ${key}`, message.channel);
          return;
        }

        if (result.deletedCount === 1) {
          rtm.sendMessage(`<@${message.user}>, removed key ${key}`, message.channel);
        } else {
          rtm.sendMessage(`<@${message.user}>, ${key} does not exist`, message.channel);
        }
      })

      return;
    }
  }
});

rtm.start();
console.log('link bot started')


app.set('port', (process.env.PORT || 5000));
//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});
