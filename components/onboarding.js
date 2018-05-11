const _ = require("underscore");
const request = require("request");
var debug = require('debug')('botkit:onboarding');
const { WebClient } = require('@slack/client');

function isUser(member) {
  console.log(member.name, member.id);
  if (member.is_bot || member.name == process.env.botName || member.name == "slackbot")
    return false;
  else
    return true;
}

module.exports = function(controller) {

    controller.on('onboard', function(bot, team, state) {
        
        console.log('Starting an onboarding experience!', state);
      
        // grab creature from first state item
        var creature = state.split(",")[0];
        // grab user ID from second state item
        var userId = state.split(",")[1];
        var thisUser;
      
        // Make sure we have the studio token
        if (controller.config.studio_token) {
          // open im with user that added this app
          bot.api.im.open({user: userId }, function(err, direct_message) {
            if (err) {
                debug('Error sending onboarding message:', err);
            } else {

              console.log(bot.identity.team_id, state); 
              
              controller.storage.teams.get(bot.identity.team_id, function(err, team) {

                var web = new WebClient(team.bot.token);
                // list out users to add to team 
                // only if team users are empty - sanity check
                web.users.list({}, function (err, users) {
                  
                  if (!team.users || team.users.length <= 0) {
                    team.users = [];

                    _.each(users.members, function(user) {
                      if (isUser(user)) {
                        var user = {
                          userId: user.id, 
                          name: user.name
                        }
                        
                        team.users.push(user);
                      }
                    }); 

                  }
                  
                  // Map through the users
                  // Store creature and set them as having started
                  team.users = _.map(team.users, function(user) {
                    if (state && userId == user.userId) {
                      user.tamagotchi_type = creature;
                      user.tamagotchi_started = true;
                      thisUser = user;
                    }
                    return user;
                  });
                  
  
                  // save the team
                  controller.storage.teams.save(team, function(err, saved) {
                    console.log(saved);
                    
                    var data = {
                      puzzle: creature, 
                      user: thisUser, 
                      team: saved, 
                      codeType: "tamagotchi_egg"
                    };

                    // post in the gamelog
                    request.post({ url: 'https://escape-room-dev.glitch.me/tamagotchi_gamelog', form: data }, function(err, req, body) {

                    });
                    
                    // grab and send out onboarding script
                    controller.studio.get(bot, 'onboarding', userId, direct_message.channel.id).then(function(convo) {

                      convo.icon_url = "http://vanguardseattle.com/wp-content/uploads/2016/05/egg-emoji-unicode.jpg";
                      var value = convo.threads.default[0].attachments[0].actions[0].value + " " + creature;

                      convo.threads.default[0].attachments[0].actions[0].value = value;

                      console.log(value, convo.threads.default[0].attachments[0].actions[0].value);
                      convo.activate();
                    });
                    
                  });
                  
                });
              });
              
            }
          });
        } 
    });

}
