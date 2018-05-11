
module.exports = function(controller) {
  controller.say = function(options, cb) {
    var bot = options.bot;
    var message = options.message;
    var user = options.user;
    
    var username = controller.getUsername(user.tamagotchi_type, user.stage);

    controller.getIcon(options.icon, function(url) {

      var reply = { text: options.text, icon_url: url, username: username };

      if (options) {

        if (options.meter) {
          reply.text += "\n";
          for(var y = 0; y < options.meter.length; y++){
              reply.text += options.meter[y];
          }
        }

        if (options.attachment) {
          var attachments = options.attachment;
          reply.attachments = attachments;
        }

      }

      reply.channel = message.channel;

      reply.username += " ";

      bot.say(reply);

      cb();

    });

  }
}