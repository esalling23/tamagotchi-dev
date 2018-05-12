const _ = require("underscore");
const request = require("request");
const { WebClient } = require('@slack/client');


function isUser(member) {
  console.log(member.name, member.id);
  if (member.is_bot || member.name == process.env.botName || member.name == "slackbot")
    return false;
  else
    return true;
}

module.exports = function(webserver, controller) {
  

  webserver.get("/pickupOLD/:type/:player/:team", function(req, res) {
        
    controller.storage.teams.get(req.params.team, function(err, team) {
      
      if (!team) {
        res.render('index', {
          domain: req.get('host'),
          protocol: req.protocol,
          glitch_domain:  process.env.domain,
          layout: 'layouts/default', 
          data: { 
            team: req.params.team, 
            user: req.params.player, 
            creature: req.params.type
          }
        });
        return;
      }
      
      console.log(team);
      var token = team.bot.token;

      var web = new WebClient(token);
      web.users.list({}, function (err, users) {
        // team.users = [];
        // console.log(users.members)
        if (!team.users || team.users.length <= 0) {
          team.users = [];

          _.each(users.members, function(user) {
            if (isUser(user)) {
              team.users.push({
                userId: user.id, 
                name: user.name
              });
            }
          }); 

        }
        var thisUser = _.findWhere(team.users, { userId: req.params.player });
        var repeated = _.findWhere(team.users, { tamagotchi_type: req.params.type });
        
        console.log(thisUser);
        console.log(repeated, thisUser.tamagotchi_type);
        
        if (thisUser.tamagotchi_started || repeated) {
          // WHOA let's rethink
          var data = {
            thread: thisUser.tamagotchi_type ? "holding" : "claimed", 
            user: req.params.player, 
            team: req.params.team
          }
          res.render('error', {
            domain: req.get('host'),
            protocol: req.protocol,
            glitch_domain:  process.env.domain,
            layout: 'layouts/default'
          });
          
          request.post({ url: 'https://escape-room-dev.glitch.me/tamagotchi_error', form: data }, function(err, req, body) {
            
          });
                    
        } else {
          var thisUser;
          // find this user 
          var updated = _.map(team.users, function(user) {
            if (user.userId == req.params.player) {
              user.tamagotchi_type = req.params.type;
              user.escape_id = req.params.player;
              thisUser = user;
            }
            return user;
          });

          team.users = updated;
          
          controller.storage.teams.save(team, function(err, saved) {
            console.log("someone grabbed an egg so we saved their type!", saved);
            
            res.render('pickup', {
              domain: req.get('host'),
              protocol: req.protocol,
              glitch_domain:  process.env.domain,
              layout: 'layouts/default', 
              data: { 
                team: req.params.team, 
                player: thisUser.userId, 
                type: req.params.type, 
                clientId: process.env.clientId
              }
            });
          });
          
        }
        
      });
    });
        
  });
  
};