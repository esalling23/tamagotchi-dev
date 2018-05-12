var _ = require("underscore");

// Timeout Variables
var countdown = 5000;

var eggTimeout = 5000;
var chickTimeout = 5000;

var warmth = 0;
var hunger = 0;
var statusTime = 1000;
var hatchedStatusTime = 1000;
var progress = [":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:"];
var hungerMeter = [":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:"];
var poopMeter = [":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:", ":red_circle:"]

var hatchedCount = 0;
var winCount = 0;
var poopCount = 0;
var poops = 0;

var started = false;
var gameOver = false;
var hatched = false;

var eggIntervalId;
var chickIntervalId;

var eggEmoji = "http://vanguardseattle.com/wp-content/uploads/2016/05/egg-emoji-unicode.jpg";
var daedalusEmoji = "https://avatars.slack-edge.com/2017-11-08/269162770516_e2c4553016a99b14da83_72.png";
var chickEmoji = "http://d2trtkcohkrm90.cloudfront.net/images/emoji/apple/ios-10/256/front-facing-baby-chick.png";
var skullEmoji = "https://www.emojibase.com/resources/img/emojis/apple/x1f480.png.pagespeed.ic.sgphl_7Fk3.png";

// Status Messages
var poopStatusMsg;
var statusMsg;
var hungerStatusMsg;
var progressMsg;

var channel = 'C8X8SJM0Q';

var eggIntervalId;
var chickIntervalId;


module.exports = function(controller) {
  
  // Hears Functions
  
  controller.hears(["New Tamagotchi"], ["direct_message","direct_mention","mention","ambient"], function(bot,message) {
    hatched = false;
    gameOver = false;
    started = true;
    
    if(warmth <= 0 || warmth > 100) {
        // start with 1/2 warmth (50/100)
        warmth = 50;
        say("I'm an egg. Keep me warm to hatch me.", eggEmoji, bot, message, []);

        // Start the egg-hatching process
        eggIntervalId = setInterval(function(){

            eggStatusCheck(bot, message);
          
        }, eggTimeout);
     }    
  });
  

    // Nice N Warm
  controller.hears([":sunny:"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {

    if(gameOver == false && started == true && hatched == false) {
      warmth += 5;
      if(warmth > 100) {

        clearInterval(eggIntervalId);
        say("I'm cooked! To restart, type 'New Tamagotchi'!", skullEmoji, bot, message);

      } else {
        clearInterval(eggIntervalId);
        // Start the egg-hatching process
        eggIntervalId = setInterval(function(){

            eggStatusCheck(bot, message);
          
        }, eggTimeout);
      }
      for(var x = 0; x < warmth/5; x++){
        progress[x] = ":white_check_mark:";
      }
      progressMsg = 'Yum! Thanks! My warmth is now at ' + warmth + '%!\n';
      if(warmth > 100){
        progressMsg = "";
      }
      if(hatched) {
        statusTime = 3000;
        say(progressMsg, chickEmoji, bot, message, { meter: progress });

      } else {
        statusTime = 1000;
        say (progressMsg, eggEmoji, bot, message, { meter: progress });

      }
    }
  });

  // Not Quite Warm
  controller.hears([":mostly_sunny:", ":partly_sunny:", ":barely_sunny:", ":partly_sunny_rain:", ":cloud:", ":rain_cloud:", ":thunder_cloud_and_rain:", ":lightning:", ":zap:", ":snowflake:", ":snow_cloud:", ":tornado:", ":fog:", ":umbrella_with_rain_drops:"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    if(gameOver == false && started == true && hatched == false) {
      
      clearInterval(eggIntervalId);
      // Start the egg-hatching process
      eggIntervalId = setInterval(function(){

          eggStatusCheck(bot, message);

      }, eggTimeout);

      if(warmth > 0) {
        warmth -= 5;
        warmth += 5;

        if(warmth > 0 && warmth <= 100) {
            warmth -= 5;
        }
        else if(warmth < 0){
            warmth = 0;
        }
        for(var x = 0; x < warmth/5; x++){
            progress[x] = ":white_check_mark:";
        }
        for(var x = warmth/5; x < 20; x++){
            progress[x] = ":red_circle:";
        }

        statusMsg = "Ooh! That's colder than I want it to be! My current warmth is at " + warmth + '%!\n';
        getWarmthStatus(warmth);

        if(warmth >= 0 && warmth <= 100) {
          
          if(hatched) {
            statusTime = 3000;
            say(statusMsg, chickEmoji, bot, message, { meter: progress });
            clearInterval(eggIntervalId);

          }
          else {
            statusTime = 1000;
            say(statusMsg, eggEmoji, bot, message, { meter: progress });

          }
        }
      } else {
        say("You lose! To restart, type 'New Tamagotchi'!", skullEmoji);

        clearInterval(eggIntervalId);
        gameOver = true;
        started = false;
      }

      statusTime = 1000;
    }
  });

    // Good Food
  controller.hears([":green_apple:", ":apple:", ":pear:", ":tangerine:", ":lemon:", ":banana:", ":watermelon:", ":grapes:", ":strawberry:", ":melon:", ":cherries:", ":peach:", ":pinapple:", ":tomato:", ":eggplant:", ":hot_pepper:", ":corn:", ":sweet_potato:"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    if(gameOver == false && hatched == true && started == true) {
      hatchedStatusTime = 1000;
      hunger += 10;
      if(hunger > 100) {
        clearInterval(chickIntervalId);
        say("Ow, I have a tummy ache! To restart, type 'New Tamagotchi'!", skullEmoji, bot, message);

      } else {
        clearInterval(chickIntervalId);
        // Start the egg-hatching process
        chickIntervalId = setInterval(function() {

            chickStatusCheck(bot, message);

        }, chickTimeout);

      }
      for(var x = 0; x < hunger/10; x++){
        hungerMeter[x] = ":white_check_mark:";
      }
      hungerStatusMsg = 'Yum! Thanks! My hunger is now at ' + hunger + '%!\n';
      if(warmth > 100){
        hungerStatusMsg = "";
      }
      say(hungerStatusMsg, chickEmoji, bot, message, { meter: hungerMeter });

      poopCount += 1;
      if(poopCount == 3) {
        poops += 1;
        for(var x = 0; x < poops; x++) {
          poopMeter[x] = ":poop:";
        }

        getPoopStatus(poops);
        
        say(poopStatusMsg, chickEmoji, bot, message, { meter: poopMeter });

        poops = 0;
        poopCount = 0;
      }
    }
  });

    // Bad food
  controller.hears([":honey_pot:", ":bread:", ":cheese_wedge:", ":poultry_leg:", ":meat_on_bone:", ":fried_shrimp:", ":egg:", ":hamburger:", ":fries:", ":hotdog:", ":pizza:", ":spaghetti:", ":taco:", ":burrito:", ":ramen:", ":stew:", ":fish_cake:", ":sushi:", ":bento:", ":curry:", ":rice_ball:", ":rice:", ":rice_cracker:", ":oden:", ":dango:", ":shaved_ice:", ":ice_cream:", ":icecream:", ":cake:", ":birthday:", ":custard:", ":candy:", ":lollipop:", ":chocolate_bar:", ":popcorn:", ":doughnut:", ":cookie:", ":beer:", ":beers:", ":wine_glass:", ":cocktail:", ":tropical_drink:", ":champagne:", ":sake:", ":tea:", ":coffee:", ":baby_bottle:"],function(bot,message) {
     if(gameOver == false && hatched == true && started == true) {
        hatchedStatusTime = 1000;
        if(hunger > 0) {
          hunger -= 5;
          hunger += 5;
          hungerStatusMsg = "Ew! I can't eat that! ";

          if(hunger > 0 && hunger <= 100) {
              hunger -= 10;
          }
          else if(hunger < 0){
              hunger = 0;
          }

          for(var x = 0; x < hunger/10; x++){
              hungerMeter[x] = ":white_check_mark:";
          }

          for(var x = hunger/10; x < 10; x++){
              hungerMeter[x] = ":red_circle:";
          }

          getHungerStatus(hunger);

          if(hunger >= 0 && hunger <= 100) {
            say(hungerStatusMsg, chickEmoji, bot, message, { meter: hungerMeter });
          }
        }
        else {
          say("You lose! To restart, type 'New Tamagotchi'!", skullEmoji, bot, message);

          clearInterval(chickIntervalId);
          gameOver = true;
          started = false;
        }

        hatchedStatusTime = 1000;
    }
  });

  // Poop hears
  controller.hears([":sweat_drops:", ":droplet:", ":potable_water:", ":ocean:"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    if(poops > 0 && hatched == true) {
      poopStatusMsg = "";
      poops -= 1;
      for(var x = poopMeter.length - 1; x >= poops; x--) {
        poopMeter[x] = ":red_circle:";
      }
      
      if(poops == 0) {
        poopStatusMsg = "All Clean! Thanks!\n" + poopStatusMsg;
      }
      else {
        poopStatusMsg = "Thanks!\n" + poopStatusMsg;
      }
      
      say(poopStatusMsg, chickEmoji, bot, message, { meter: poopMeter });

    }
  });

  // General Hello Fallback
  controller.hears(["Hello","Hi"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {

    bot.reply(message,'Hello, how are you today?');

  });
  
  // Custom Functions

  var say = function(text, emoji, bot, message, options) {
    
    if (options) {
      if (options.meter) {
        for(var y = 0; y < options.meter.length; y++){
            text += options.meter[y];
        }
      }
    }
    
    bot.reply(message, {
       text: text,
       icon_url: emoji
    });
    
  }

  var getWarmthStatus = function(warmth) {
      statusMsg = 'My current warmth is at ' + warmth + '%!\n';

      if(warmth <= 90 && warmth >= 70){
          hatchedCount += 1;
        statusMsg += "Ahhh perfect - change nothing!\n"; 
      }

      if(warmth <= 100 && warmth >= 80){
          statusMsg += "It's chilly but I'm okay.\n"; 
      }
      else if(warmth < 80 && warmth >= 50){
          statusMsg += "Please turn up the heat now.\n";
      }
      else if(warmth < 50 && warmth >= 20){
          statusMsg += "Critical I need warmth!!!!\n";
      }
      else {
          statusMsg += "I'm like a inch from death, dude! SAVE ME!\n";
      }
  }

  var getHungerStatus = function(hunger) {
      hungerStatusMsg = 'My current hunger is at ' + hunger + '%!\n';

      if(hunger <= 100 && hunger >= 90){
        winCount++;
          hungerStatusMsg += "I'm all full now, thanks!\n"; 
      }
      else if(hunger < 90 && hunger >= 70){
          hungerStatusMsg += "Hmm... I think I could use a snack....\n";
      }
      else if(hunger < 70 && hunger >= 30){
          hungerStatusMsg += "I'm really, really hungry! Please feed me!\n";
      }
      else {
          hungerStatusMsg += "I'm STARVING! FEED ME NOW!\n";
      }
  }

  var getPoopStatus = function(poops) {
    if(poops <= 2) {
      poopStatusMsg = "I poo'd. Please clean it up.\n";
    }
    else if(poops == 3) {
      poopStatusMsg = "I feel sick. Please clean me!\n";
    }
    else if(poops == 4) {
      poopStatusMsg = "This is disgusting! I feel awful! Clean me now!\n";
    }
    else if(poops == 5) {
      clearInterval(chickIntervalId);
      gameOver = true;
      started = false;
      poopStatusMsg = "I died of dysentery. Type 'New Tamagotchi' to restart\n";
    }
  }
  
  var eggStatusCheck = function(bot, message) {
      if(warmth > 0 && warmth <= 100) 
          warmth -= 5;
      else if(warmth < 0)
          warmth = 0;

      for(var x = 0; x < warmth/5; x++){
          progress[x] = ":white_check_mark:";
      }
      for(var x = warmth/5; x < 20; x++){
          progress[x] = ":red_circle:";
      }

      getWarmthStatus(warmth);

      if(hatchedCount >= 5) {
        hunger = 80;
        hatched = true;
        say("I hatched! I'm a weird chicken thing now! Please help me stay alive. If you do a good job, I will reward you with something great!", chickEmoji, bot, message);

        // Get rid of the egg interval count
        clearInterval(eggIntervalId);
        // Start the chick meal process
        chickIntervalId = setInterval(function() {

            chickStatusCheck(bot, message);

        }, chickTimeout);

      } else if(warmth > 0 && warmth <= 100) { // Not hatched yet
        say(statusMsg, eggEmoji, bot, message, {meter: progress});
      } else if (warmth <= 0 && !gameOver) { // Gameover

          clearInterval(eggIntervalId);

          say("You lose! To restart, type 'New Tamagotchi'!", skullEmoji, bot, message);

          gameOver = true;
          started = false;
      } 
  }
  
  var chickStatusCheck = function(bot, message) {
    if(warmth > 0 && warmth <= 100) 
        warmth -= 5;
    else if(warmth < 0)
        warmth = 0;

    for(var x = 0; x < warmth/5; x++){
        progress[x] = ":white_check_mark:";
    }
    for(var x = warmth/5; x < 20; x++){
        progress[x] = ":red_circle:";
    }
    // Based on the warmth, find the status message associated
    getWarmthStatus(warmth);

    if(warmth > 0 && warmth <= 100) {
      for(var y = 0; y < progress.length; y++) {
          statusMsg += progress[y];
      }
      say(statusMsg, chickEmoji, bot, message);

    } else if (warmth <= 0 && !gameOver) {

        clearInterval(eggIntervalId);
      say("You lose! To restart, type 'New Tamagotchi'!", skullEmoji, bot, message);

        gameOver = true;
        started = false;
    }
      if(hatchedStatusTime > 0){
          hatchedStatusTime -= 1;
      }
      else {
          if(hunger > 0 && hunger <= 100) {
              hunger -= 10;
          }
          else if(hunger < 0){
              hunger = 0;
          }
          for(var x = 0; x < hunger/10; x++){
              hungerMeter[x] = ":white_check_mark:";
          }
          for(var x = hunger/10; x < 10; x++){
              hungerMeter[x] = ":red_circle:";
          }

        getHungerStatus(hunger);

          if(winCount >= 10) {
              clearInterval(chickIntervalId);
              gameOver = true;
              started = false;
              hatched = false;
            say("Thanks for helping me thrive! Enjoy this alphanumeric code: sqd09erbs2. To restart, type 'new tamagotchi'.", chickEmoji, bot, message);

          }

          if(hunger > 0 && hunger <= 100){
            say(hungerStatusMsg, chickEmoji, bot, message);

          } else if(hunger <= 0){
              clearInterval(chickIntervalId);
            say("You lose! To restart, type 'New Tamagotchi'!", skullEmoji, bot, message);

          }
      }
  }
  
}