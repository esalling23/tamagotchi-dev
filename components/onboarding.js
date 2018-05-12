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

              // save the team
              controller.storage.teams.save(team, function(err, saved) {
                console.log(saved);

              });

            });
          });
              
        } 
    });

}
