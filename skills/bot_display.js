const botIcons = {
  skull: "https://www.emojibase.com/resources/img/emojis/apple/x1f480.png.pagespeed.ic.sgphl_7Fk3.png",
  daedalus: "https://avatars.slack-edge.com/2017-11-08/269162770516_e2c4553016a99b14da83_72.png",
  egg: "http://vanguardseattle.com/wp-content/uploads/2016/05/egg-emoji-unicode.jpg", 
  hatched_chick: "http://d2trtkcohkrm90.cloudfront.net/images/emoji/apple/ios-10/256/front-facing-baby-chick.png", 
  chicken: "http://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/chicken.png", 
  snake: "https://cdn.shopify.com/s/files/1/1061/1924/products/Snake_Iphone_Emoji_JPG_large.png?v=1513340498",
  crocodile: "https://cdn.shopify.com/s/files/1/1061/1924/products/Crocodile_Iphone_Emoji_JPG_large.png?v=1513340499", 
  turtle: "https://cdn.shopify.com/s/files/1/1061/1924/products/Turtle_Iphone_Emoji_JPG_grande.png?v=1513340500", 
  sauropod: "https://images.emojiterra.com/google/android-oreo/512px/1f995.png",
  lizard: "https://images.emojiterra.com/twitter/512px/1f98e.png", 
  trex: "https://images.emojiterra.com/google/android-oreo/512px/1f996.png", 
  shrimp: "https://images.emojiterra.com/google/android-oreo/512px/1f990.png",
  dragon: "https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/dragon_1f409.png"
}

const botEmojis = {
  chicken: [':hatched_chick:', ':chicken:'], 
  snake: [':snake:', ':crocodile:'], 
  turtle: [':turtle:', ':sauropod:'], 
  lizard: [':lizard:', ':t-rex:'], 
  shrimp: [':shrimp:', ':dragon:']
}

const eggNames = {
  chicken: "Clucking Egg",
  snake: "Slithery Egg", 
  shrimp: "Squishy Egg", 
  lizard: "Scaly Egg", 
  turtle: "Flipping Egg"
}

const hatchNames = {
  chicken: "Hatched Chick",
  snake: "Snake", 
  shrimp: "Shrimp", 
  lizard: "Lizard", 
  turtle: "Turtle"
}

const evolveNames = {
  chicken: "Chicken",
  snake: "Crocodile", 
  shrimp: "Dragon", 
  lizard: "T-Rex", 
  turtle: "Sauropod"
}

module.exports = function(controller) {
  
  controller.getUsername = function(creature, stage) {
    var names = [eggNames, hatchNames, evolveNames][stage];
    var username = names[creature];
    return username;
  }
  
  controller.getIcon = function(creature, cb) {
    console.log(creature, " is the creature we need an icon for");
    creature = creature.replace(/:/g, "").replace(/-/g, "");
    
    var url = botIcons[creature];
    console.log(url, "is the url we found for htat creatures icon");
    
    cb(url);
    
  }
  
  controller.getEmoji = function(creature, stage, cb) {
    
    var emoji = botEmojis[creature][stage - 1];
    
    cb(emoji);
    
  }
}
