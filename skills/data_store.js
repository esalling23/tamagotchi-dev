const _ = require("underscore");

module.exports = function(controller) {
  
  controller.dataStore = function(event, type, opt) {
    
    var ObjectID = require('bson').ObjectID;
        
    var dataEvent = {
      id: new ObjectID(),
      team: event.team.id ? event.team.id : event.team, 
      user: event.user,
      channel: event.channel,
      time: new Date()
    }
    
    console.log(event, event.raw_message);
    console.log(event.original_message);
    
    if (type == "button") {
      dataEvent.type = event.actions[0].type;
      dataEvent.action = event.actions[0].name;
      dataEvent.btnText = event.actions[0].text;
      dataEvent.value = event.actions[0].value ? event.actions[0].value : event.actions[0].selected_options[0].value;
      dataEvent.from = event.callback_id;
    } else if (type == "chat") {
      dataEvent.message = event.text;
      dataEvent.type = event.type;
    } 
    
    console.log(dataEvent);
    
    controller.storage.events.save(dataEvent, function(err, saved) {
      console.log(err, saved, "SAVED!!");
    });
    
  };
  
}