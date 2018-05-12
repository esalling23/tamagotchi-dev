const _ = require("underscore");

const { WebClient } = require('@slack/client');


function isUser(member) {
  console.log(member.name, member.id);
  if (member.is_bot || member.name == process.env.botName || member.name == "slackbot")
    return false;
  else
    return true;
}

module.exports = function(webserver, controller) {

  webserver.get("/check/:team", function(req, res) {
    console.log(req.params.team);
        
    
    controller.storage.teams.get(req.params.team, function(err, team) {
      
      if (!team) {
        res.send({ grabbed: [] });
        return;
      }
      
      var grabbed = _.filter(team.users, function(user) {
        if (user.tamagotchi_type && user.tamagotchi_started)
          return user;
      });
      
      grabbed = _.map(grabbed, function(user) {
        return { userId: user.userId, type: user.tamagotchi_type };
      });
      
      console.log(grabbed);
      
      res.send({ grabbed: grabbed });

    });
    
  });
  
};