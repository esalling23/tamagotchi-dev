

module.exports = function(controller) {
  
  controller.warmthLogic = function(bot, message, user, vars, cb) {

    setProgress(user.warmth, user.warmthMeter, user.tamagotchi_type);

    controller.getStatus(user.tamagotchi_type, user.warmth, vars.input, function(result) {
      
      console.log(result, result.action);
      
      if (result.action != 'death') {

        if (result.action == "hatched" && !user.hatched) {
          console.log("we have hatched!!!!!!!");
          user.newHatch = true;
          user.hatched = true;
        }

        var msg = "";
        
        if (vars.text)
          msg = vars.text;
        
        var options = {
          bot: bot, 
          message: message, 
          icon: "egg", 
          user: user, 
          text: msg + result.msg, 
          meter: user.warmthMeter
        }

        controller.say(options, function() {
          cb(user);
        });

      } else 
        controller.trigger("egg_death", [bot, message, user, result.msg]);


    });
    
  };
  
  
  var setProgress = function(int, progress, type) {
    
    console.log(int, type);
    var check = ":white_check_mark:";
    var nope = ":o:";
    
    for(var x = 0; x < int/5; x++){
        progress[x] = check;
    }

    for(var x = int/5; x < 20; x++){
        progress[x] = nope;
    }
    
  }
  
};