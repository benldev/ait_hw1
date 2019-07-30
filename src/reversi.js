


function repeat(value, n){
  let arr = [];
  for(let r = 0; r < n; r++){
    arr.push(value);
  }
  return arr;
}

function generateBoard(rows, columns, initialCellValue){
  let num = rows * columns;
  let arr = [];
  for(let r = 0; r < num; r++){
    arr.push(initialCellValue);
  }
  return arr;
}

function rowColToIndex(board, rowNumber, columnNumber){
  let num = Math.sqrt(board.length);
  return num * rowNumber + columnNumber; 
}

function indexToRowCol(board, i){
  let ret = {};
  let len = Math.sqrt(board.length);
  ret.row = Math.floor(i / len);
  ret.col = i % len;
  return ret;
}

function setBoardCell(board, letter, row, col){
  let index = rowColToIndex(board, row, col);
  let ret = board.slice();
  ret[index] = letter;
  return ret; 
}

function algebraicToRowCol(algebraicNotation){
  let str = algebraicNotation;
  let slice = str.slice(1);
  if(str.length < 2 || str.length > 3 || 
     !str[0].match(/[A-Z]/) || !str[1].match(/[0-9]/) ||
     (str.length == 3 && !str[2].match(/[0-9]/)) ||
     (str.length == 3 && (parseInt(slice) < 10 ||
      parseInt(slice) > 26)) || (str.length == 2 && 
     parseInt(slice) === 0)){
    return undefined;
  }
  else{
    return {col: str[0].charCodeAt(0) - 'A'.charCodeAt(0),
            row: parseInt(slice) - 1}
  }
}

function placeLetters(board, letter, ...algebraicNotation){
  for(let x = 0; x < algebraicNotation.length; x++){
    let pos = algebraicToRowCol(algebraicNotation[x]);
    board = setBoardCell(board, letter, pos.row, pos.col);
  }
  return board; 
}

function boardToString(board){
  let len = Math.sqrt(board.length);
  let s1 = "  ";
  let s2 = "   +";
  for(let i = 0; i < len; i++){
    s1 += "   " + String.fromCharCode(65 + i);
    s2 += "---+";
  }
  s2 += "\n"
  let ret = s1 + "  \n" + s2;
  for(let i = 0; i < len; i++){
    let line = " " + (i+1) + " |";
    for(let j = 0; j < len; j++){
      line += " " + board[i * len + j] + " |";
    }
    line += "\n";
      ret += line + s2;
  }
  return ret;
}

function isBoardFull(board){
  let len = board.length;
  for(let i = 0; i < len; i++){
    if(board[i] === " "){
      return false;
    }
  }
  return true;
}

function flip(board, row, col){
  let index = rowColToIndex(board, row, col);
  if(board[index] === 'X'){
    board[index] = 'O';
  }
  else if(board[index] === 'O'){
    board[index] = 'X'
  } 
  return board;
}

function flipCells(board, cellsToFlip){
  for(let i = 0; i < cellsToFlip.length; i++){
    for(let j = 0; j < cellsToFlip[i].length; j++){
      flip(board, cellsToFlip[i][j][0], cellsToFlip[i][j][1]);
    }
  }
  return board;
}

function getCellsToFlip(board, lastRow, lastCol){
  let incre = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
  let tar = board[rowColToIndex(board, lastRow, lastCol)];
  let opp = "X";
  if(tar === "X") {opp = "O";}
  let ret = [];
  for(let i = 0; i < 8; i++){
    let buf = [];
    let r = lastRow + incre[i][0], c = lastCol + incre[i][1];  
    while(inBoundary(board, r, c) && board[rowColToIndex(board, r, c)] === opp){
      buf.push([r, c]);
      r += incre[i][0];
      c += incre[i][1];
    }
    if(inBoundary(board, r, c) && board[rowColToIndex(board, r, c)] === tar && buf.length > 0) {
      ret.push(buf);
    }    
  }
  return ret;
}  
function inBoundary(board, row, col){
  let len = Math.sqrt(board.length);
  if(row < 0 || row >= len || col < 0 || col >= len){
    return false;
  }
  return true;
}
function isValidMove(board, letter, row, col){
  let index = rowColToIndex(board, row, col);
  if(inBoundary(board, row, col) && board[index] === " " && getCellsToFlip(setBoardCell(board, letter, row, col), row, col).length != 0) {
    return true;
  }
  return false;
}

function isValidMoveAlgebraicNotation(board, letter, algebraicNotation){
  let pos = algebraicToRowCol(algebraicNotation);
  return isValidMove(board, letter, pos.row, pos.col);
}

function getValidMoves(board, letter){
  let ret = [];
  for(let i = 0; i < board.length; i++){
    let pos = indexToRowCol(board, i);
    if(isValidMove(board, letter, pos.row, pos.col)){
      ret.push([pos.row, pos.col]);
    }
  }
  return ret;
}

function getLetterCounts(board){
  let ret = {X : 0, O : 0};
  for(let i = 0; i < board.length; i++){
    if(board[i] === 'X') {ret.X = ret.X + 1;}
    if(board[i] === 'O') {ret.O = ret.O + 1;}
  }
  return ret;
}
 
module.exports = {
  repeat: repeat,
  generateBoard: generateBoard,
  rowColToIndex: rowColToIndex, 
  indexToRowCol: indexToRowCol,
  setBoardCell: setBoardCell,
  algebraicToRowCol: algebraicToRowCol,
  placeLetters: placeLetters,
  boardToString: boardToString,
  isBoardFull: isBoardFull,
  flip: flip,
  flipCells: flipCells,
  getCellsToFlip: getCellsToFlip,
  isValidMove: isValidMove,
  isValidMoveAlgebraicNotation: isValidMoveAlgebraicNotation,
  getValidMoves: getValidMoves,
  getLetterCounts: getLetterCounts
}
