const _ = require("underscore");
const request = require("request");

const progress = [":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:"];

const creatures = {
  chicken: [':hatched_chick:', ':chicken:'], 
  snake: [':snake:', ':crocodile:'], 
  turtle: [':turtle:', ':sauropod:'], 
  lizard: [':lizard:', ':t-rex:'], 
  shrimp: [':shrimp:', ':dragon:']
}

module.exports = function(controller) {
  
  controller.on('new', function(bot, message) {
        
    var messageUser = message.user ? message.user : message.event.user;
    
    controller.storage.teams.get(bot.config.id, function(err, res) {
      
      var thisUser = _.findWhere(res.users, { userId: messageUser });
      console.log(thisUser);
      // trigger new tamagotchi
      controller.trigger("start", [{
        bot: bot,
        message: message,
        team: res, 
        user: thisUser, 
        type: thisUser.tamagotchi_type
      }]);
      
    });
    
  });
 
  controller.on('start', function(options) {
    
    console.log("starting over");

    var message = options.message;
    var bot = options.bot;
    var team = options.team;
    var thisUser = options.user;
    
    thisUser.hatched = false;
    
    thisUser.gameOver = false;
    thisUser.started = true;
    thisUser.stage = 0;
    
    thisUser.warmth = 50;
    
    if (options.type == "snake")
      thisUser.warmth = 30;
        
    thisUser.warmthMeter = progress;
    
    thisUser.creature = creatures[options.type][0];
    
    var users = _.map(team.users, function(user) {
      if (user.userId == thisUser.userId) {
        return thisUser;
      } else 
        return user;
    });
    
    team.users = users;
    
    // console.log(team.users);
    
    controller.storage.teams.save(team, function(err, saved) {
      // console.log(err, saved.users);
      var savedUser = _.findWhere(saved.users, { userId: thisUser.userId });
      // console.log(savedUser);
      controller.trigger("egg", [bot, message, savedUser, thisUser.tamagotchi_type]);
    });
    
  });
  
  controller.on("egg", function(bot, message, user, type) {
    var text;
    
    if (["chicken", "shrimp", "snake"].includes(type)) 
      text = "Hello! Please hatch me. I’m cold. Can you warm me up?";
    else if (type == "lizard" || type == "turtle")
      text = "Hello! Please hatch me. It’s too hot. Can you cool me down?";
    else 
      text = "What am I ?? Cann ot comput e!! 12095-=F DF 535_ffjpj, F,. C";

    var params = {
      bot: bot, 
      message: message,
      user: user,
      text: text,
      icon: "egg"
    };
    
    controller.say(params, function() {

      setTimeout(function() {

        controller.warmthLogic(bot, message, user, {}, function(updated) {
          saveTeam(bot.config.id, updated);
        });

      }, 500);
    });   
    
  });
  
  
  controller.on("warmth", function(bot, message, user, amount, input) { 
        
    user.warmth += amount*5;

    var vars = {
      input: input
    }

    controller.warmthLogic(bot, message, user, vars, function(updated) {

      // console.log(updated, " is the user after the warmth logic" );
      if (updated.hatched && updated.newHatch) {
        updated.stage = 1;
        updated.newBoardBtns = true;
      }
      
      saveTeam(bot.config.id, updated, function(savedUser) {

        // console.log(saved.stage, " is the stage we just updated");
        if (savedUser.stage > 0) {
          
          setTimeout(function() {
                        
            var params = {
              bot: bot, 
              message: message,
              user: savedUser,
              text: "Wowee, nice work, I've hatched!",
              icon: savedUser.creature.replace(/:/g, "").replace(/-/g, "")
            };
            
            controller.say(params, function() {
              console.log("now that we said that, let's set up the board");
              
              controller.trigger("board_setup", [bot, message, savedUser.tamagotchi_type, savedUser.stage]);
              
              var data = {
                puzzle: savedUser.tamagotchi_type, 
                user: savedUser, 
                team: bot.config.id, 
                codeType: "tamagotchi_hatch"
              };

              request.post({ url: 'https://escape-room-production.glitch.me/tamagotchi_gamelog', form: data }, function(err, req, body) {

              });

            });
            
          }, 500);
          
        }

      });
      
    });
      
  });
  
  controller.on("win_state", function(bot, message, user, text) {
    
    user.gameOver = true;
    user.won = true;
    user.started = false;
    
    saveTeam(bot.config.id, user, function(saved) {
    
      if (!text) text = "You Won!!";
      var winMsg = text;

      if(["chicken", "lizard"].includes(saved.tamagotchi_type)) {
        winMsg += "\nOh! I know! A hint! You know that bookshelf you saw earlier? Check out the " + process.env.book + " book.";
      }
      else if (["snake", "turtle"].includes(saved.tamagotchi_type)) {
        winMsg += "\nOh! I know! A hint! You know that bookshelf you saw earlier? Check out the " + process.env.page + " page of a book.";
      }
      else if (saved.tamagotchi_type == "shrimp") {
        winMsg += "\nOh! I know! A hint! You know that bookshelf you saw earlier? Check out the " + process.env.line + " line of a page of a book.";
      }
      
      var creature = saved.creature.replace(/:/g, "");
      
      var params = {
        bot: bot, 
        message: message,
        user: user,
        text: winMsg,
        icon: saved.creature.replace(/:/g, "").replace(/-/g, "")
      };
      
      controller.say(params, function() {
      
      });

    });
    
  });
  
  
  controller.on("egg_death", function(bot, message, user, text) {
    
    user.gameOver = true;
    user.started = false;
    
    saveTeam(bot.config.id, user, function(saved) {
    
      if (!text) text = "I've died!";
      
      var params = {
        bot: bot, 
        message: message,
        user: user,
        text: text,
        icon: "skull"
      };

      controller.say(params, function() {
        setTimeout(function() {
          controller.trigger("new", [bot, message, saved.tamagotchi_type]);
        }, 500);
      });
      
    });
    
  });
  
  controller.on("creature_death", function(bot, message, user, text) {
    
    user.gameOver = true;
    user.started = false;
    
    saveTeam(bot.config.id, user, function(saved) {
    
      if (!text) text = "You lose!";
            
      var params = {
        bot: bot, 
        message: message,
        user: user,
        text: text,
        icon: "skull"
      };

      controller.say(params, function() {
        setTimeout(function() {
         controller.trigger("board_setup", [bot, message, saved.tamagotchi_type, saved.stage]);
        }, 500);
      });
      
    });
    
  });
  
  
 
  
  var saveTeam = function(teamId, user, cb) {
    
    controller.storage.teams.get(teamId, function(err, result) {
      
      // console.log(result, "is the team being saved");
      var currentUser;
      
      var updated = _.map(result.users, function(u) {
        if (u.userId == user.userId) {
          currentUser = user;
          return user;
        } else 
          return u;
      });
      
      result.users = updated;
      // console.log(currentUser.newChicken, "is the current user newChicken");
            
      controller.storage.teams.save(result, function(err, saved) {
        // console.log(err, _.findWhere(saved.users, { userId: currentUser.userId }));
        if (cb) cb(currentUser);
      });

    });

  }


    
}