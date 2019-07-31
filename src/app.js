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
  let passCnt = 0;
  let nextMove = "X";
  let board = game.boardPreset.board;
  let playerLetter = game.boardPreset.playerLetter;
  let computerLetter = "X";
  let startStr = "";
  let computerMoves = game.scriptedMoves.computer;
  let playerMoves = game.scriptedMoves.player;
  let turn = 0;
  if (playerLetter === "O") {turn = 1;} 
  if (computerMoves.length != 0){
    startStr += "Computer will make the following moves: " + computerMoves + "\n";
  }
  if (playerMoves.length != 0){
    startStr += "The player will make the following moves: " + playerMoves + "\n";
  }
  startStr += "Player is " + playerLetter + "\n" + rev.boardToString(board);
  console.log(startStr);
  if(playerLetter === "X") {computerLetter = "O";}
  do{
    if(turn == 0){
      let validMoves = rev.getValidMoves(board, playerLetter);
      if(validMoves.length > 0){
        do{
          var move = readlineSync.question("What is your move?\n> ");
          if(!rev.isValidMoveAlgebraicNotation(board, playerLetter, move)){
            console.log("INVALID MOVE. Your move should:\n* be in a format\n* specify an existing empty cell\n* flip at elast one of your oponent's pieces\n\n");        
          }
          else{
            board = rev.placeLetters(board, playerLetter, move);
            let movePos = rev.algebraicToRowCol(move);
            board = rev.flipCells(board, rev.getCellsToFlip(board, movePos.row, movePos.col)); 
            console.log(boardAndScore(board));
            passCnt = 0;            
            break; 
          }
        } while(true);
      }
      else {
        console.log("No valid moves available for you.\nPress <ENTER> to pass.\n");
        readlineSync.question();
        passCnt++;
      }
    }       
  } while(passCnt != 2 && !rev.isBoardFull(board));

}
function boardAndScore(board){
  var cnt = rev.getLetterCounts(board);
  var ret = "Score\n=====\nX: " + cnt.X + "\nO: " + cnt.O + "\n";
  return rev.boardToString(board) + ret;
}
