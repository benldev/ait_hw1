var rev = require('./reversi.js');
var readlineSync = require('readline-sync');
var fs = require('fs');

if(process.argv.length < 3){
  userControlledGame();
}
else{
  fs.readFile(process.argv[2], 'utf8', function(err, data) {
    if (err) { userControlledGame();}
    else { scriptedGame(data); }
  });
}

function userControlledGame(){
  const promptLen = "How wide should the board be? (even numbers between 4 and 26, inclusive)\n> ";
  var len = -1;
  do{
    len = readlineSync.question(promptLen);
  } while (isNaN(len) || len != parseInt(len, 10) || len < 4 || len > 26 || len % 2 != 0);
  const promptColor = "Pick your letter: X (black) or O (white)\n> ";
  var color = "";
  do{
    color = readlineSync.question(promptColor);
  } while (color !== "X" && color !== "O");
  let board = rev.generateBoard(len, len, " ");
  let r = len / 2 - 1, c = r;
  board[rev.rowColToIndex(board, r, c)] = "O";
  board[rev.rowColToIndex(board, r + 1, c + 1)] = "O";
  board[rev.rowColToIndex(board, r, c + 1)] = "X";
  board[rev.rowColToIndex(board, r + 1, c)] = "X";
  let game = {boardPreset: {playerLetter: color, board: board}, scriptedMoves: {player: [], computer: []}};
  console.log("REVERSI\n"); 
  playGame(game);
}

function scriptedGame(data){
  let game = JSON.parse(data);
  console.log("REVERSI\n");
  playGame(game);  
}
function playGame(game){
  console.log("Player is " + game.boardPreset.playerLetter + ".\n");
  console.log(rev.boardToString(game.boardPreset.board));
  let turn = {who: "player", letter: "X"};
  game.turn = turn;
  game.passes = 0;
  if(game.boardPreset.playerLetter == "O"){
    turn.who = "computer";
  }
  do{    
    makeMove(game);
    nextTurn(turn);
    console.log(boardAndScore(game.boardPreset.board));        
  }while(!gameOver(game));
  console.log(results(game)); 
}
function makeMove(game){
  let board = game.boardPreset.board;
  let isPlayer = (game.turn.who === "player");
  let validMoves = rev.getValidMoves(board, game.turn.letter);
  if(validMoves.length === 0){
    readlineSync.question((isPlayer ? "You" : "Computer") + " has no valid moves. Press <Enter> to pass.\n");
    game.passes += 1;
  }
  else{
    let move = getMove(game, isPlayer);
    moveMove(move, game);
    game.passes = 0;
  }
}
function getMove(game, isPlayer){
  let board = game.boardPreset.board;
  let playerLetter = game.boardPreset.playerLetter;
  let scripted = game.scriptedMoves[isPlayer ? "player" : "computer"];
  if(scripted.length != 0){
    let move = scripted.shift();
    readlineSync.question((isPlayer ? "Player" : "Computer") + " move to " + move + " is scripted. Press <Enter> to see move.\n");
    return rev.algebraicToRowCol(move);
  }
  if(isPlayer){
    do{
      let move = readlineSync.question("What is your move?\n> ");
      if(!rev.isValidMoveAlgebraicNotation(board, playerLetter, move)){
        console.log("INVALID MOVE. Your move should:\n* be in a format\n* specify an existing empty cell\n* flip at elast one of your oponent's pieces\n\n");        
      }
      else{
        return rev.algebraicToRowCol(move);
      }
    } while(true);
  }
  else{
    let validMoves = rev.getValidMoves(board, game.turn.letter);
    let move = validMoves[Math.floor(Math.random()*validMoves.length)];
    readlineSync.question("Press <Enter> to see computer's move.\n");
    return {row: move[0], col: move[1]};
  } 
}
function moveMove(move, game){
  game.boardPreset.board = rev.setBoardCell(game.boardPreset.board, game.turn.letter, move.row, move.col);
  rev.flipCells(game.boardPreset.board, rev.getCellsToFlip(game.boardPreset.board, move.row, move.col));
}
function nextTurn(turn){
  if(turn.who === "player"){turn.who = "computer";}
  else{turn.who = "player";}
  if(turn.letter === "X"){turn.letter = "O";}
  else{turn.letter = "X";}
}
function gameOver(game){
  return rev.isBoardFull(game.boardPreset.board) || game.passes === 2;
}
function boardAndScore(board){
  var cnt = rev.getLetterCounts(board);
  var ret = "Score\n=====\nX: " + cnt.X + "\nO: " + cnt.O + "\n";
  return rev.boardToString(board) + ret;
}
function results(game){
  let cnt = rev.getLetterCounts(game.boardPreset.board);
  let player = game.boardPreset.playerLetter;
  let computer = "O";
  if(player === "O") {computer = "X";}
  if(cnt[player] > cnt[computer]) {return "You won!";}
  else if(cnt[player] === cnt[computer]){return "Tie!";}
  else {"You lost!";}
}
