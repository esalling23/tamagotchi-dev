const _ = require("underscore");
const request = require("request");

const { WebClient } = require('@slack/client');

const token = process.env.slackToken;

var web = new WebClient(token);

var eggIntervalId;
var chickIntervalId;

var emojis = [];

var specialEmojis = [":fried_egg:"];


module.exports = function(controller) {
  
  var deleteThisMsg = function(message, token, callback) {
    
    // console.log(message, "we are deleting this");
    
    var ts = message.message_ts ? message.message_ts : message.ts;
    
    var web = new WebClient(token);
      
    web.chat.delete(ts, message.channel).then(res => {
      // console.log(res, "deleted");
      callback();
    }).catch(err => console.log(err));
  }
  // Emoji request 
  request("https://raw.githubusercontent.com/iamcal/emoji-data/master/emoji.json", function(err, res, body) {
    if (!err && res.statusCode == 200) {
       var importedJSON = JSON.parse(body);
      // console.log(importedJSON);
      
      _.each(importedJSON, function(item) {
        // console.log(item.short_name);
        emojis.push(":" + item.short_name + ":");
      });
    }
  });
  
  _.each(specialEmojis, function(sp) {
    emojis.splice(emojis.indexOf(sp), 1);
    
  });
  
  // Hears Functions
  
  controller.hears(["restart", "start"], ["direct_message","direct_mention","mention","ambient"], function(bot,message) {
    
    console.log("start");
    controller.trigger("new", [bot, message]);
          
  });
  
  controller.hears(["clear"], ["direct_message","direct_mention","mention","ambient"], function(bot,message) {
    
    console.log("start");
    controller.storage.teams.get(message.team_id, function(err, res) {
      res.users = _.map(res.users, function(user) {
        return { userId: user.userId, name: user.name };
      });
      controller.storage.teams.save(res, function(err, saved) {
        console.log(saved, "saved this team, all clear!!");
        bot.reply(message, "thanks, make sure to pickup a new egg!");
      });
    });
  });
  
  controller.hears("(.*)", ["direct_message"], function(bot, message) {
    controller.storage.teams.get(message.team_id, function(err, res) {
      
      var thisUser = _.findWhere(res.users, { userId: message.user });
      
      controller.dataStore(message, "chat");
      
      console.log("anything");
    
      if(!thisUser.gameOver && thisUser.started && thisUser.stage == 0) {
        console.log(message);
        controller.trigger("emoji_message", [bot, message, thisUser.tamagotchi_type]);
      } else {
        deleteThisMsg(message, res.oauth_token, function() {
          console.log("no thanks");
        });
      }
    });
  });
  
  
}


function say(text, emoji, bot, message, options) {
    
    if (options) {
      if (options.meter) {
        for(var y = 0; y < options.meter.length; y++){
            text += options.meter[y];
        }
      }
    }
    
    bot.reply(message, {
       text: text,
       icon_url: emoji
    });
    
}
  