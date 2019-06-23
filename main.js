let turnCount = 0;
let whoseTurn = "X";
let occupiedCells = {
  all: [],
  X: [],
  O: []
};
let cells = [];
let startOverButton = document.getElementById("startOver");
startOverButton.style = "opacity: 0";
let statusMessage = document.getElementById("status");
statusMessage.textContent = "Player " + whoseTurn + "'s turn!";
let currentState = "gameStarted";
let winningTriple = [];

let states = {
  waiting: { canChangeTo: ["gameStarted"] },
  gameStarted: { canChangeTo: ["gameFinished"] },
  gameFinished: { canChangeTo: ["gameStarted"] }
};

function restartGame() {
  turnCount = 0;
  whoseTurn = "X";
  occupiedCells = {
    all: [],
    X: [],
    O: []
  };
  startOverButton.style = "opacity: 0";
  statusMessage.textContent = "Player " + whoseTurn + "'s turn!";
  currentState = "gameStarted";
  winningTriple = [];
  for (cell of cells) {
    cell.textContent = '';
  }
}

function enterState(newState) {
  let validTransitions = states[currentState].canChangeTo;
  if (validTransitions.includes(newState)) {
    currentState = newState;
  } else {
    throw "Invalid state transition attempted - from " +
      currentState +
      " to " +
      newState;
  }
}

startOverButton.addEventListener("click", () => {
  if (turnCount > 0) {
    restartGame();
  }
});

function findAllCells() {
  let count = 0;
  while (count < 9) {
    cells.push(document.getElementById("cell-" + count));
    count++;
  }
}

findAllCells();

cells.forEach(cell => {
  cell.addEventListener("click", () => playCell(cell));
});

function playCell(cell) {
  if (
    currentState === "gameStarted" &&
    occupiedCells.all.includes(cellToNumber(cell)) === false
  ) {
    startOverButton.style = "opacity: 1"
    cell.textContent = whoseTurn;
    turnCount++;
    if (turnCount >= 5) {
      //no one can win until turn 5
      if (checkForWin(cellToNumber(cell))) {
        console.log("player " + whoseTurn + " won with cells " + winningTriple);
        enterState("gameFinished");
        statusMessage.textContent =
          "Player " +
          whoseTurn +
          " has won with cells " +
          winningTriple +
          "!!!!";
      }
    }
    occupiedCells[whoseTurn].push(cellToNumber(cell));
    occupiedCells[whoseTurn].sort();
    occupiedCells.all = occupiedCells.all.concat(occupiedCells[whoseTurn]);
    occupiedCells.all.sort();
    if (currentState === "gameStarted") {
      if (whoseTurn === "X") {
        whoseTurn = "O";
      } else {
        whoseTurn = "X";
      }
      if (turnCount < 9) {
        statusMessage.textContent = "Player " + whoseTurn + "'s turn!";
      } else {
        statusMessage.textContent = "The match has ended in a draw...";
      }
    }
    console.log("turn: " + turnCount);
    console.log("x occupies: " + occupiedCells["X"]);
    console.log("o occupies: " + occupiedCells["O"]);
  }
}

function cellToNumber(cell) {
  return Number(cell.outerHTML.slice(14, 15));
}

function checkForWin(cell0) {
  //the function only inputs the most recent cell played because if a win was achieved this turn, the cell played this turn must be a part of the winning triple
  let cell1Arr = occupiedCells[whoseTurn].slice(0);
  for (cell1 of cell1Arr) {
    //because of where we checkForWin in the playCell function, cellThisTurn is not yet in occupiedCells
    let cell2Arr = setDifference(cell1Arr, [cell1]); //we want to ignore the cell we've already chosen when we choose our third cell
    for (cell2 of cell2Arr) {
      console.log("testing cells " + cell0 + ", " + cell1 + ", " + cell2);
      if (
        (cell0 + cell1 + cell2) / 3 === 4 &&
        (cell0 === 4 || cell1 === 4 || cell2 === 4)
      ) {
        //catches diagonals and center column, center row
        console.log("passed check 0");
        winningTriple = [cell0, cell1, cell2].sort();
        return true;
      }
      if (cell0 % 3 === cell1 % 3 && cell1 % 3 === cell2 % 3) {
        //catches columns
        console.log("passed check 1");
        winningTriple = [cell0, cell1, cell2].sort();
        return true;
      }
      if (
        cell0 % 3 !== cell1 % 3 &&
        cell0 !== cell2 % 3 &&
        cell1 % 3 !== cell2 % 3 &&
        Math.floor(cell0 / 3) === Math.floor(cell1 / 3) &&
        Math.floor(cell1 / 3) === Math.floor(cell2 / 3)
      ) {
        //to catch rows, we make sure they are distinct mod 3 but have the same quotient when divided by 3
        console.log("passed check 2");
        winningTriple = [cell0, cell1, cell2].sort();
        return true;
      }
    }
    cell1Arr = setDifference(cell1Arr, [cell1]); //after we tried cell1 with every other cell, cell1 won't work for any triple, so we can forget about it
  }
  return false;
}

function setDifference(minuend, subtrahend) {
  //5-3=2; 5: minuend, 3: subtrahend, 2: difference; a "set difference" in math, usually denoted by \, takes two sets, finds their intersection, and returns the former set without any of the values in the intersection. here "sets" are arrays
  if (typeof minuend !== "object" || typeof subtrahend !== "object") {
    throw "setDifference needs objects as arguments";
  }
  let returnArray = [];
  let flag = 0; //used to mark if two values in the arrays are similar at any point
  for (i in minuend) {
    for (j in subtrahend) {
      if (minuend[i] === subtrahend[j]) {
        flag = 1;
        break;
      }
    }
    if (flag === 0) {
      returnArray.push(minuend[i]);
    }
    flag = 0;
  }
  return returnArray;
}
