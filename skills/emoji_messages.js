const request = require("request");
const _ = require("underscore");

var emojis = [];

module.exports = function(controller) {
  
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

  controller.on("emoji_message", function(bot, message, type) {

    var messageUser = message.user ? message.user : message.event.user;

    controller.storage.teams.get(message.team_id, function(err, res) {

      var thisUser = _.findWhere(res.users, { userId: messageUser });

      var emojiMessage = 0;
      var thisEmoji;

      _.each(message.event.text.split(" "), function(word) {
        console.log(word);
        if (emojis.includes(word)) {
          console.log("it's an emoji!");
          if (!thisEmoji || thisEmoji == word) {
            thisEmoji = word;
            emojiMessage = 1;
          } else
            emojiMessage++;
        } 
      }); 

      if(!thisEmoji)
        thisEmoji = "text";

//       console.log(thisEmoji, emojiMessage);

      var amount;

      if (emojiMessage > 0) {

        if (emojiMessage > 1) {
          amount = -1;
        } else {
          if (type == "turtle" && [":snow_cloud:", ":snowflake:", ":snowman:", ":snowman_without_snow:"].includes(thisEmoji)){
            controller.trigger("egg_death", [bot, message, thisUser]);
            return;
          }
          amount = checkEmojis(thisEmoji, type);
        }

      } else {
        if (type == "shrimp") {
          controller.trigger("egg_death", [bot, message, thisUser]);
          return;
        }
        amount = checkText(type);
      }
 
      // console.log(amount);

      controller.trigger("warmth", [bot, message, thisUser, amount, thisEmoji]);

    });

  });
  
}

var checkText = function(type) {
  var score = 0;
  switch (type) {
    case "chicken":
      score = -4;
      break;
      
    case "snake":
      score = -2;
      break;
    
    case "turtle":
      score = 2;
      break;
  }
  
  return score;
}

var checkEmojis = function(item, type) {
  var score = 0;
    
  switch (type) {
    case "chicken":
      if (item == ":fire:")
        score = 3;
      else if (item == ":snowflake:") 
        score = -2;
      else 
        score = -4;
      break;
      
    case "snake":
      if (item == ":sunny:")
        score = 1;
      else  
        score = -3;
      break;
    
    case "lizard":
      if (item == ":sunny:")
        score = 1;
      else if (item == ":snowflake:") 
        score = -2;
      else if (item == ":snow_cloud:")
        score = -3;
      else 
        score = 5;
      break;
    case "turtle":
      if (item == ":droplet:")
        score = -2;
      else 
        score = 1;
      break;
    case "shrimp":
      if (item == ":fire:")
        score = 2;
      else 
        score = -1;
      break;
  }
  
  return score;
}