var dbHelper = require('./dbHelper.js');

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bot_token = process.env.SLACK_BOT_TOKEN || '';

var config = require('./config.js');

var rtm = new RtmClient(config.apiKey);

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.text && message.text.includes(`<@${rtm.activeUserId}>`)) {
    // --- GET LINK ---
    if (message.text.toLowerCase().includes('link me')) {
      var link = message.text.toLowerCase().split('link me ')[1];
      console.log(`looking for ${link}`);

      dbHelper.get(link, function(result) {
        console.log('callback: ', result);
        if (result.length > 0 && typeof result[0].link !== 'undefined') {
          rtm.sendMessage(`<@${message.user}>, ${result[0].link}`, message.channel);
        } else {
          rtm.sendMessage(`<@${message.user}>, could not find the link.`, message.channel);
        }
      })
    }

    // --- SAVE LINK ---
    if (message.text.toLowerCase().includes('save link')) {
      var keyAndLink = message.text.toLowerCase().split('save link ')[1];

      var parts = keyAndLink.split(' ');
      //console.log('parts, ', parts);
      var key = parts[0];
      var link = parts[1].replace('<', '').replace('>', '');

      dbHelper.insert(key, link, function(result) {
        console.log('callback insert: ', result);
        rtm.sendMessage(`<@${message.user}>, inserted link ${link} with key ${key}`, message.channel);
      })
    }

    // --- UPDATE LINK ---

    // --- REMOVE LINK ---
  }
});

rtm.start();
