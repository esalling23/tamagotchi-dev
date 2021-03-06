var debug = require('debug')('botkit:oauth');
var request = require("request");

module.exports = function(webserver, controller) {

    var handler = {
        login: function(req, res) {
          // console.log(req, res);
          var data = req.params;
          console.log(data);
          res.redirect("https://slack.com/oauth/authorize?state=" + data.type + "," + data.player + "&team="+ data.team + "&client_id=" + process.env.clientId + "&scope=bot,users:read");

        },
        oauth: function(req, res) {
            var code = req.query.code;
            var state = req.query.state;

            // we need to use the Slack API, so spawn a generic bot with no token
            var slackapi = controller.spawn({});

            var opts = {
                client_id: controller.config.clientId,
                client_secret: controller.config.clientSecret,
                code: code
            };

            slackapi.api.oauth.access(opts, function(err, auth) {

                if (err) {
                    debug('Error confirming oauth', err);
                    return res.redirect('/login_error.html');
                }

                // what scopes did we get approved for?
                var scopes = auth.scope.split(/\,/);

                // use the token we got from the oauth
                // to call auth.test to make sure the token is valid
                // but also so that we reliably have the team_id field!
                slackapi.api.auth.test({token: auth.access_token}, function(err, identity) {

                    if (err) {
                        debug('Error fetching user identity', err);
                        return res.redirect('/login_error.html');
                    }

                    // Now we've got all we need to connect to this user's team
                    // spin up a bot instance, and start being useful!
                    // We just need to make sure this information is stored somewhere
                    // and handled with care!

                    // In order to do this in the most flexible way, we fire
                    // a botkit event here with the payload so it can be handled
                    // by the developer without meddling with the actual oauth route.

                    auth.identity = identity;
                    controller.trigger('oauth:success', [auth, state]);

                    res.cookie('team_id', auth.team_id);
                    res.cookie('bot_user_id', auth.bot.bot_user_id);
                    res.redirect('/login_success.html');

                });


            });
        }
    }

    
    // Create a /oauth link
    // This is the link that receives the postback from Slack's oauth system
    // So in Slack's config, under oauth redirect urls,
    // your value should be https://<my custom domain or IP>/oauth
    debug('Configured /oauth url');
    webserver.get('/oauth', handler.oauth);
  
    // https://github.com/howdyai/botkit/blob/master/readme-slack.md#custom-auth-flows
    webserver.get('/login/:type/:player/:team', handler.login);

    return handler;
}
