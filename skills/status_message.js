
var statusMsg;
var action;

module.exports = function(controller) {
  
  controller.getStatus = function(type, int, input, callback) {
    
    console.log(type, int);
    console.log(input);
    
    action = "";
    statusMsg = "";

    var status;
    switch (type) {
        
      case "snake":
        status = getSnakeStatus(int, input);
        break;
        
      case "chicken":
        status = getChickenStatus(int, input);
        break;

      case "lizard":
        status = getLizardStatus(int, input);
        break;

      case "turtle":
        status = getTurtleStatus(int, input);
        break;  

      case "shrimp":
        status = getShrimpStatus(int, input);
        break;
    }
    
    console.log(status);
    
    callback(status);
    
  }
  
  var getChickenStatus = function(warmth, input) {
    statusMsg = 'My current warmth is at ' + warmth + '%!\n';
    if (!input)
      return { msg: statusMsg, action: action };

    if(warmth == 85){
      action = "hatched";
    } 

    if (warmth < 20) {
      statusMsg += "I froze to death. Try again?\n";
      action = "death";
    } else if (warmth > 100) {
      statusMsg += "Oh no, you cooked me! Try again?";
      action = "death";
    }

    if ([":fire:", ":snowflake:"].includes(input)) {
      var hot = input == ":fire:";

      if (warmth <= 100 && warmth >= 90) {
        statusMsg += hot ? "Ouch! Ouch! Too hot!\n" : "Still too hot!"; 
      } else if(warmth <= 80 && warmth >= 70){
        statusMsg += hot ? "Oh boy, getting close!\n" : "This is a little too cold, can you warm me up please?";
      } else if(warmth < 65 && warmth >= 55){
        statusMsg += hot ? "Thanks! Getting toasty! A little warmer please\n" : "No! I need to warm up now!";
      } else if(warmth <= 50 && warmth >= 20){
        statusMsg += hot ? "Oh thank goodness! I needed that! A little warmer please!\n" : "Oh no, you’re freezing me!";
      }
    } else if (input == "text") {
      statusMsg += "Ack, I don’t understand! Please warm me up!";
    } else {
      statusMsg += "That’s not what I need! Oh no…";
    }
    
    return { msg: statusMsg, action: action }
    
  }
  
  var getSnakeStatus = function(warmth, input) {
    statusMsg = 'My current warmth is at ' + warmth + '%!\n';
    if (!input)
      return { msg: statusMsg, action: action };
    
    if(warmth == 75){
      action = "hatched";
    } 
    
    if (warmth <= 10) {
      statusMsg += "I froze to death. Try again?\n";
      action = "death";
    } else if (warmth >= 95) {
      statusMsg += "Oh no, you cooked me! Try again?";
      action = "death";
    }
    
    if (input == ":sunny:") {
      if (warmth <= 100 && warmth >= 90) {
        statusMsg += "Ouch! Ouch! Too hot!\n"; 
      } else if(warmth < 60 && warmth >= 40){
        statusMsg += "Thanks! Getting toasty! A little warmer please\n";
      } else if(warmth < 50 && warmth >= 20){
        statusMsg += "Oh thank goodness! I needed that! A little warmer please!\n";
      }
    } else if (input == "text") {
      statusMsg += "Ack, I don’t understand! Please warm me up!";
    } else {
      statusMsg += "That’s not what I need! Oh no…";
    }
    
    return { msg: statusMsg, action: action };
      
  }
  
  var getLizardStatus = function(warmth, input) {
    statusMsg = 'My current warmth is at ' + warmth + '%!\n';
    if (!input) {
      return { msg: statusMsg, action: action };
    }

    if(warmth == 30){
      action = "hatched";
    } 

    if (warmth <= 0) {
      statusMsg += "I froze to death. Try again?\n";
      action = "death";
    } else if (warmth >= 90) {
      statusMsg += "Oh no, you cooked me! Try again?";
      action = "death";
    }

    if ([":snow_cloud:", ":snowflake:", ":sunny:"].includes(input)) {
      if(warmth <= 90 && warmth >= 65){
        statusMsg += "Oh thank goodness! I needed that! A little cooler please!";
      } else if(warmth <= 60 && warmth >= 45){
        statusMsg += "Thanks! Getting better! A little cooler please...";
      } else if(warmth <= 40 && warmth >= 35){
        statusMsg += "Oh boy, getting close!";
      } else if(warmth <= 25 && warmth >= 5){
        statusMsg += "Oh no, that’s TOO cold! Please warm me up";
      }
    }
    else if (input == "text") {
      statusMsg += "Ack, I don’t understand! Please warm me up!";
    } else {
      statusMsg += "That’s not what I need! Oh no…";
    }

    return { msg: statusMsg, action: action };
  }
  
  var getTurtleStatus = function(warmth, input) {
    statusMsg = 'My current warmth is at ' + warmth + '%!\n';
    if (!input) {
      return { msg: statusMsg, action: action };
    }

    if(warmth == 40){
      action = "hatched";
    } 

    if (warmth <= 20) {
      statusMsg += "I froze to death. Try again?\n";
      action = "death";
    } else if (warmth >= 80) {
      statusMsg += "So hot… so dry… I died. Try again?";
      action = "death";
    }

    if (input == ":droplet:") {
      if(warmth >= 45 && warmth <= 75){
        statusMsg += "Oh thank you! That’s much better! Please cool me off and hatch me.";
      }
    } else if ([":snow_cloud:", ":snowflake:", ":snowman:", ":snowman_without_snow:", ":snow_capped_mountain:"].includes(input)) {
      statusMsg += "You froze me to death! No! Try again?";
      action = "death";
    } else if (input == "text") {
      statusMsg += "Ack, I don’t understand! It’s too dry in here!";
    } else {
      if(warmth >= 40 && warmth <= 75){
        statusMsg += "It’s too hot in here! I’m drying out!";
      }
    }

    return { msg: statusMsg, action: action };
  }
  var getShrimpStatus = function(warmth, input) {
      statusMsg = 'My current warmth is at ' + warmth + '%!\n';
      if (!input) {
      return { msg: statusMsg, action: action };
      }

      if(warmth > 100){
        action = "hatched";
      } 
    
      if (warmth <= 25) {
        statusMsg += "I froze to death. Try again?\n";
        action = "death";
      } 

      if (input == ":fire:") {
        if(warmth <= 100 && warmth >= 85){
          statusMsg += "Oh boy, getting close!";
        } else if(warmth >= 65 && warmth <= 80){
          statusMsg += "Thanks! Getting toasty! A little hotter please...";
        } else if(warmth >= 35 && warmth <= 60){
          statusMsg += "Oh thank goodness! I needed that! Make me hotter, please!";
        }
      } else if (input == "text") {
        statusMsg += "That’s not what I need! You’re freezing me! Help!";
      } else {
        statusMsg += "I don’t understand. You just bored me to death.";
        action = "death";
      }

      return { msg: statusMsg, action: action };
  }
}