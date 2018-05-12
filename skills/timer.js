var warmthInterval;
var warmthTime = 0;
var warmthIntervalTracker;

var foodInterval;
var foodTime = 0;
var foodIntervalTracker;

var warmthTimer = 10000;
var hungerTimer = 15000;
// var interval;
module.exports = function(controller) {
  
  controller.timer = function(isNew, id, type, callback) {
        
    if (type == "warmth" || type == "all"){
      console.log("clearing warmth interval bc of type: ", type);
      
      clearInterval(warmthInterval);
      
      if (!isNew) 
        warmthTimer = warmthTimer - warmthTime;
      else 
        warmthTime = 0;
      
      warmthInterval = setInterval(function() {
        console.log("warmth interval hit", id);
        clearInterval(warmthIntervalTracker);
        warmthTime = 0;
        warmthIntervalTracker = setInterval(function() {
          warmthTime++;
        }, 1);

        callback(id);
      }, warmthTimer);
      
      warmthIntervalTracker = setInterval(function() {
        warmthTime++;
      }, 1);
      
    }      
    
    if (type == "hunger" || type == "all") {
            console.log("clearing hunger interval bc of type: ", type);

      clearInterval(foodInterval);
      
      if (!isNew) 
        hungerTimer = hungerTimer - foodTime;
      else 
        foodTime = 0;
      
      foodInterval = setInterval(function() {
        console.log("food interval hit", id);
        clearInterval(foodIntervalTracker);
        foodTime = 0;
        foodIntervalTracker = setInterval(function() {
          foodTime++;
        }, 1);
        callback(id);
      }, hungerTimer);
      
      foodIntervalTracker = setInterval(function() {
        foodTime++;
      }, 1);
    }      
    
    
  }
  
  controller.killTimer = function(type, callback) {
    
    if (type == "warmth" || type == "all")
      clearInterval(warmthInterval);
    
    if (type == "hunger" || type == "all")
      clearInterval(foodInterval);
    
    callback();
    
  }
}