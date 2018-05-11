const _ = require("underscore");
const randomEmoji = require("random-emoji");

var onboard_text = "Use the buttons to get me to the food! If you move me off the board I will die and you will have to start over. When I get to the food, I’ll evolve!\n";

var food_icons = {
  chicken: ':corn:', 
  snake: ':mouse:', 
  turtle: ':bug:', 
  lizard: ':strawberry:', 
  shrimp: ':herb:'
}

var positions = {
  chicken: { creature: [35, 35], food: [[43], [7, 56]] }, 
  snake: { creature: [35, 35], food: [[43], [7, 56]] }, 
  turtle: { creature: [35, 35], food: [[43], [7, 56]] }, 
  lizard: { creature: [35, 35], food: [[43], [7, 56]] },
  shrimp: { creature: [35, 35], food: [[43], [7, 56]] }
}

module.exports = function(controller) {
  controller.on("board_setup", function(bot, message, type, stage) {
    
    // console.log(message, type);

    var team = message.team.id ? message.team.id : message.team;

    controller.studio.get(bot, "board_stage_" + stage, message.user, message.channel).then(function(convo) {
      
      var thread = convo.threads.default[0];
      
      controller.storage.teams.get(team, function(err, team) {
        
        var thisUser = _.findWhere(team.users, { userId: message.user });
        
        var boardSetup = setUpBoard(type, thisUser.creature, stage);
        var board = boardSetup.board;
        
        thisUser.startingTile = { tile: boardSetup.startingTile, pos: positions[type].creature[stage-1] };
          
        var text = "";

        for (var x = 0; x <= board.length; x++) {
          var tile = board[x];

          if (tile)
            text += tile;
        };
        
        thisUser.board = board;
        thisUser.food = { 
          name: food_icons[type], 
          pos_1: positions[type].food[0], 
          pos_2: positions[type].food[1], 
        };
        
        thread.text = onboard_text + text;
        
        var msgSetup = setMsgBtns(thread.attachments, thisUser);
        thisUser = msgSetup.thisUser;
        thread.attachments = msgSetup.attachments;
        
        team.users = _.map(team.users, function(user) {
          if (user.userId == message.user) 
            return thisUser;
          else 
            return user;
        });
        
        controller.getIcon(thisUser.creature, function(url) {
          
          thread.icon_url = url;
          thread.username = controller.getUsername(thisUser.tamagotchi_type, thisUser.stage);
          
          controller.storage.teams.save(team, function(err, saved) {
            convo.activate();
          });

        });
        
        
      });
      
    });
      
  });
};

function setMsgBtns(attachments, thisUser) {
  
  var btn_emojis = [];
  var msg_btns_saved = [];
  // store ALL buttons from ALL attachments
  var msg_btns = attachments[0].actions;

  if (thisUser.stage == 2) msg_btns = msg_btns.concat(attachments[1].actions);

  var saved_btns = thisUser["board_btns_" + thisUser.stage];

  if (saved_btns) btn_emojis = btn_emojis.concat(saved_btns);

  for (var x = 0; x < msg_btns.length; x++) {
    var btn = msg_btns[x];
    var stored_btn = _.findWhere(btn_emojis, { value: btn.value });

    if (btn_emojis.length > 0 && stored_btn) {
      btn.text = stored_btn.emoji;
      msg_btns_saved[btn_emojis.indexOf(stored_btn)] = btn;
    } else {
      var definitelyNewEmoji = false;
      var emoji = randomEmoji.random({count: 1})[0].character;

      while(!definitelyNewEmoji) {
        if (btn_emojis.length > 0) {
           _.each(btn_emojis, function(e) {
             definitelyNewEmoji = (emoji != e);
           });
        } else 
          definitelyNewEmoji = true;
      }

      btn_emojis.push({ emoji: emoji, value: btn.value });
      btn.text = emoji;
      msg_btns_saved.push(btn);
    }
  }
  
  msg_btns = msg_btns_saved;
  
  if (thisUser.newBoardBtns) {
    var shuffledBtns = [];
    msg_btns = _.shuffle(msg_btns);
    _.each(msg_btns, function(btn) {
      shuffledBtns[msg_btns.indexOf(btn)] = _.findWhere(btn_emojis, { value: btn.value });
    });
    btn_emojis = shuffledBtns;
    thisUser.newBoardBtns = false;
  }

  attachments[0].actions = _.first(msg_btns, 4);
  
  if (thisUser.stage == 2) attachments[1].actions = _.last(msg_btns, 4);

  if (!saved_btns || saved_btns.length < btn_emojis.length) 
    thisUser["board_btns_" + thisUser.stage] = btn_emojis;
  
  return { attachments: attachments, thisUser: thisUser };

}



function setUpBoard(type, creature, stage) {
  
  var partialBoard = [];
  var board = [];
  
  var white = ":white_large_square:";
  var black = ":black_large_square:";
  
  var startingTile;
  var foodReplacements = [];
  
  var emoji = creature;
  var foodMoji = food_icons[type];

  var creaturePos = positions[type].creature[stage - 1];
  var foodPos = positions[type].food[stage - 1];
  
  // first row
  for (var x = 0; x < 8; x++) {
    if (x % 2 == 0 || x == 0) 
      partialBoard.push(white);
    else
      partialBoard.push(black);
    
    if (x == 7)
      partialBoard[7] += "\n";
  }
  // second row
  for (var x = 0; x < 8; x++) {
    if (x % 2 == 0 || x == 0) 
      partialBoard.push(black);
    else
      partialBoard.push(white);

    if (x == 7)
      partialBoard[15] += "\n";
  }
    
  // multiply partial board to create full board
  for (var x = 0; x < 4; x++) {
    _.each(partialBoard, function(tile) {
      board.push(tile);
    });
  }
  
  startingTile = board[creaturePos];
  
  // Place creature
  board[creaturePos] = emoji;

  // Place food
  _.each(foodPos, function(p) {
    foodMoji = foodMoji.replace("\n", "");
    
    if (p % 8 == 7 && !foodMoji.includes("\n"))
      foodMoji += "\n";
    
    foodReplacements.push(board[p]);
    board[p] = foodMoji;

  });
  
  return { board:board, startingTile: startingTile, foodReplacements: foodReplacements };
}