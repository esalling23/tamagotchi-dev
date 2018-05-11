const _ = require("underscore");
const request = require("request");

var onboard_text = "Use the buttons to get me to the food! If you move me off the board I will die and you will have to start over. When I get to the food, I’ll evolve!\n";

module.exports = function(controller) {
  
  controller.on("board_button", function(params) {
    
    var bot = params.bot;
    var message = params.event;
    var user = params.user;
    var btn = params.btn;
    var reply = message.original_message;
    
    controller.storage.teams.get(message.team.id, function(err, team) {
      // console.log(userIcon, user.board);
      // check current user position
      var currentPos = user.board.indexOf(user.creature);
      if (currentPos < 0) currentPos = user.board.indexOf(user.creature + "\n");
      
      var replacementTile;

      if (currentPos == user.startingTile.pos)
        replacementTile = user.startingTile.tile;
      else 
        replacementTile = user.currentTile;
      
      if (!replacementTile.includes('square'))
        replacementTile = getReplacementTile(currentPos, user.board);
      
      var newPos = checkRules(user, btn, currentPos);
      // console.log(newPos, "is the new position");
      
      if (newPos == "death") {
        controller.trigger("board_disable", [bot, message]);
        controller.trigger("creature_death", [bot, message, user, ":skull_and_crossbones::skull_and_crossbones:You died! Start over now. :skull_and_crossbones::skull_and_crossbones:"]);
        return;
      }
      
      user.currentTile = user.board[newPos];
      
      var userIcon = user.creature;
      if (newPos % 8 == 7) 
        userIcon = user.creature + "\n";     
      
      user.board[currentPos] = replacementTile;
      user.board[newPos] = userIcon;
      
      team.users = _.map(team.users, function(u) {
        if (u.userId == user.userId)
          return user;
        else
          return u;
      });
      
      controller.storage.teams.save(team, function(err, saved) {    
                
        var text = "";
    
        for (var x = 0; x <= user.board.length; x++) {
          var tile = user.board[x];

          if (tile)
            text += tile;
        };
        
        bot.api.chat.update({
          channel: message.channel, 
          ts: reply.ts, 
          text: onboard_text + text, 
          attachments: reply.attachments
        }, function(err, updated) {
          
          console.log(updated, " we updated this baord");
          
          var opt = {
            bot: bot, 
            message: message,
            updated: updated, 
            user: user, 
            team: saved, 
            newPos: newPos
          }
          
          controller.trigger("food_pickup_check", [opt])
          
        });    

      });
    });
    // check if they are off the board
    
  });
  
  controller.on("board_disable", function(bot, message) {
    
    console.log(message, " we want to disable this board message");
    var reply = message.original_message ? message.original_message : message.message;
    var channel = message.channel;
    var ts = message.message_ts ? message.message_ts : message.ts;
    
    _.each(reply.attachments, function(row) {
      console.log(row.actions, " is a row of buttons");
      _.each(row.actions, function(btn) {
        console.log(btn, " is a button");
        btn.value = "disabled";
        btn.name = "disabled";
      });
    });
    
    if (reply.attachments) 
      console.log(reply.attachments[0].actions, " are the reply's actions");

    bot.api.chat.update({
      channel: channel, 
      ts: ts, 
      text: reply.text,
      attachments: reply.attachments
    }, function(err, updated) { console.log("updated") });

  });
  
  controller.on("food_pickup_check", function(options) {
    
    var bot = options.bot;
    var message = options.message;
    var updated = options.updated;
    
    var user = options.user;
    var saved = options.team;
    var newPos = options.newPos;
    
    // console.log(user.food["pos_" + user.stage]);
    var full = false;

    _.each(user.food["pos_" + user.stage], function(pos) {
      
      if (newPos == pos) {
        user.food["pos_" + user.stage].splice(user.food["pos_" + user.stage].indexOf(newPos), 1);
        console.log("we picked up food");

        if (user.food["pos_" + user.stage].length < 1) {
          full = true;
          if (user.stage == 1) {
            user.stage = 2;
            user.newBoardBtns = true;
            controller.getEmoji(user.tamagotchi_type, user.stage, function(emoji) {
              user.creature = emoji;
            });
          } else if (user.stage == 2) {
            console.log("we won!");
            var data = {
              puzzle: user.tamagotchi_type, 
              user: user, 
              team: bot.config.id, 
              codeType: "tamagotchi_complete"
            };

            request.post({ url: 'https://escape-room-production.glitch.me/tamagotchi_gamelog', form: data }, function(err, req, body) {

            });
            controller.trigger("board_disable", [bot, updated]);
            controller.trigger("win_state", [bot, message, user, "Nice job, you won!! Hmm, what should your prize be..."]);
            return;
          }
        }

        saved.users = _.map(saved.users, function(u) {
          if (u.userId == user.userId)
            return user;
          else
            return u;
        });

        controller.storage.teams.save(saved, function(err, updatedTeam) {
          if (full) {
            
            controller.getIcon(user.creature, function(url) {
              var name = user.creature.replace(/:/g, "").replace(/_/g, " ");
              name = name.charAt(0).toUpperCase() + name.slice(1);

              console.log(name, " is the name of the bot!!!!");
              bot.reply(message,{
                text: "Wow, nice work! I'm full and I've evolved into a hungrier creature now!",
                username: name, 
                icon_url: url
              });

              setTimeout(function() {
                controller.trigger("board_disable", [bot, updated]);
                controller.trigger("board_setup", [bot, message, user.tamagotchi_type, user.stage]);
                
                var data = {
                  puzzle: user.tamagotchi_type, 
                  user: user, 
                  team: bot.config.id, 
                  codeType: "tamagotchi_evolve"
                };

                request.post({ url: 'https://escape-room-production.glitch.me/tamagotchi_gamelog', form: data }, function(err, req, body) {

                });
              }, 1000);
            });
            
          }
        });
      }
    });

  });
  
}

var getReplacementTile = function(currentPos, board) {
  var tilePos; 
  if (currentPos - 2 < 0 || (currentPos - 2) % 8 == 7 || (currentPos - 1) % 8 == 7)
    tilePos = currentPos + 2
  else 
    tilePos = currentPos - 2;
  
  var tile = board[tilePos].replace("\n", "");
  
  if (currentPos % 8 == 7) tile += "\n";
    
  return tile;
  
};

var checkRules = function(user, btn, pos) {
  var newPos;
  switch(btn) {
    case "A":
      if (user.stage == 1) {
        newPos = pos - 8*4;
        if (newPos < 0)
          return "death";          
      } else {
        newPos = 35;
      }
      return newPos;
      break;

    case "B":
      if (user.stage == 1) {
        if (pos % 8 == 0)
          return "death";
        
        newPos = pos - 1;
      } else {
        newPos = 27;
      }
      return newPos;

      break;
      
    case "C":
      if (user.stage == 1) {
        newPos = pos + (pos%8 + 1);
        
        if ((newPos >= Math.ceil(pos/8) * 8 && pos != Math.ceil(pos/8) * 8) || newPos > 63)
          return "death";
        
      } else {
        newPos = 28;
      }
      return newPos;

      break;
      
    case "D":
      if (user.stage == 1) {
        // console.log(pos, "is where you started");
        newPos = pos + 8;
       
        if (newPos % 8 == 0 || newPos > 63)
          return "death";
        
        // console.log(newPos - 1, "calculated ur new spot");
        newPos -= 1;
        
      } else {
        newPos = 36;
      }
      return newPos;
      break;
      
    case "E":
      newPos = pos - 8*4;
      if (newPos < 0)
        return "death";    
      
      return newPos;
      break;
      
    case "F":
      newPos = pos + 8*4;
      if (newPos > 63)
        return "death";  
      
      return newPos;
      break;
      
    case "G":
      newPos = pos - 4;
      if (pos % 8 < 4)
        return "death";
      
      return newPos;
      break;
      
    case "H":
      newPos = pos + 4;
      if (newPos % 8 < 4)
        return "death";
      
      return newPos;
      break;
  }
  
}