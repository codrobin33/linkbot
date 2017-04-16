var dbHelper = require('./dbHelper.js');

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bot_token = process.env.SLACK_BOT_TOKEN || '';

var config = require('./config.js');

var rtm = new RtmClient(config.apiKey);

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.text && message.text.includes(`<@${rtm.activeUserId}>`)) {
    // --- GET LINK ---
    if (message.text.toLowerCase().includes('link me ')) {
      var link = message.text.toLowerCase().split('link me ')[1];
      console.log(`looking for ${link}`);

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

    // --- SAVE LINK ---
    if (message.text.toLowerCase().includes('save link ')) {
      var keyAndLink = message.text.toLowerCase().split('save link ')[1];

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
