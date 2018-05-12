const _ = require("underscore");
const request = require('request');

module.exports = function(webserver, controller) {
  
  webserver.post("/pickup", function(req, res) {
    
    var teamId = req.body.team;
    var player = req.body.player;
    var type = req.body.type;
                
    controller.storage.teams.get(teamId, function(err, team) {
      
      var bot = controller.spawn(team.bot);
      
      var thisUser = _.findWhere(team.users, { userId: player });
      var repeated = _.findWhere(team.users, { tamagotchi_type: type });
      
      if (thisUser.tamagotchi_started || repeated) {
        // WHOA let's rethink
        var data = {
          thread: thisUser.tamagotchi_type ? "holding" : "claimed", 
          user: player, 
          team: team.id
        }

        request.post({ url: 'https://escape-room-dev.glitch.me/tamagotchi_error', form: data }, function(err, req, body) {

        });

      } else {
        var thisUser;
        // find this user 
        var updated = _.map(team.users, function(user) {
          if (user.userId == player) {
            user.tamagotchi_type = type;
            user.tamagotchi_started = true;
            user.escape_id = player;
            thisUser = user;
          }
          return user;
        });

        team.users = updated;

        controller.storage.teams.save(team, function(err, saved) {
          console.log("someone grabbed an egg so we saved their type!", saved);

          var data = {
            puzzle: type, 
            user: thisUser, 
            team: saved, 
            codeType: "tamagotchi_egg"
          };

          // post in the gamelog
          request.post({ url: 'https://escape-room-dev.glitch.me/tamagotchi_gamelog', form: data }, function(err, req, body) {
            bot.api.im.open({ user: data.user.userId }, function(err, direct_message) {
              controller.studio.get(bot, 'onboarding', player, direct_message.channel.id).then(function(convo) {

                convo.icon_url = "http://vanguardseattle.com/wp-content/uploads/2016/05/egg-emoji-unicode.jpg";
                var value = convo.threads.default[0].attachments[0].actions[0].value + " " + type;

                convo.threads.default[0].attachments[0].actions[0].value = value;

                console.log(value, convo.threads.default[0].attachments[0].actions[0].value);
                convo.activate();
              });
            });
          });
          
        });

      }

      
    });
    
  });
  
}