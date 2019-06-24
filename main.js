let gamesPlayed = 1;
let startTime = Date.now();
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
let timer = document.getElementById("timer");
let playerX = {
  name: "Player X",
  type: "Human",
  winCount: 0
};
let playerO = {
  name: "Player O",
  type: "Human",
  winCount: 0
};
let statusMessage = document.getElementById("status");
statusMessage.textContent = XOToPlayerName(whoseTurn) + "'s turn!";
let changeNamesButton = document.getElementById("changeNames");
let currentState = "gameStarted";
let winningTriple = [];
let playerXNameInput = document.getElementById("playerXName");
let playerONameInput = document.getElementById("playerOName");
let playerXWinCount = document.getElementById("playerXwins");
let playerOWinCount = document.getElementById("playerOwins");

let states = {
  waiting: { canChangeTo: ["gameStarted"] },
  gameStarted: { canChangeTo: ["gameFinished"] },
  gameFinished: { canChangeTo: ["gameStarted"] }
};

function restartGame() {
  resetTimer();
  runTimer();
  gamesPlayed++;
  turnCount = 0;
  if (gamesPlayed % 2 === 0) {
    whoseTurn = "X";
  } else {
    whoseTurn = "O";
  }
  occupiedCells = {
    all: [],
    X: [],
    O: []
  };
  startOverButton.style = "opacity: 0";
  statusMessage.textContent = XOToPlayerName(whoseTurn) + "'s turn!";
  currentState = "gameStarted";
  winningTriple = [];
  for (cell of cells) {
    cell.textContent = "";
    cell.style.color = "#22ff00";
  }
  console.log("restarting " + gamesPlayed + "th game...");
  computerPlays();
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
  cell.addEventListener("click", () => {
    if (XOToPlayerType(whoseTurn) === "Human") {
      playCell(cell);
    }
  });
});

cells.forEach(cell => {
  cell.addEventListener("mouseenter", () => {
    console.log("hi")
    if (XOToPlayerType(whoseTurn) === "Human") {
      considerCell(cell);
    }
  });
});

cells.forEach(cell => {
  cell.addEventListener("mouseout", () => {
    console.log("bye")
    if (XOToPlayerType(whoseTurn) === "Human" &&
    occupiedCells.all.includes(cellToNumber(cell))===false) {
      cell.style = "opacity: 1"
      cell.textContent = ''
    }
  });
});

function playCell(cell) {
  if (
    currentState === "gameStarted" &&
    occupiedCells.all.includes(cellToNumber(cell)) === false
  ) {
    startOverButton.style = "opacity: 1";
    cell.textContent = whoseTurn;
    cell.style = "opacity: 1"
    turnCount++;
    if (turnCount >= 5) {
      //no one can win until turn 5
      if (checkForWin(cellToNumber(cell))) {
        console.log("player " + whoseTurn + " won with cells " + winningTriple);
        enterState("gameFinished");
        if (whoseTurn==="X") {
          playerX.winCount++
        } else if (whoseTurn==="O") {
          playerO.winCount++
        }
        playerXWinCount.textContent = playerX.name + "'s wins: " + playerX.winCount
        playerOWinCount.textContent = playerO.name + "'s wins: " + playerO.winCount
        statusMessage.textContent =
          XOToPlayerName(whoseTurn) +
          " has won with cells " +
          winningTriple[0] +
          ", " +
          winningTriple[1] +
          ", and " +
          winningTriple[2] +
          "!!!!";
        flashWinningCells();
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
        statusMessage.textContent = XOToPlayerName(whoseTurn) + "'s turn!";
      } else {
        statusMessage.textContent = "The match has ended in a draw...";
      }
    }
    console.log("turn: " + turnCount);
    console.log("x occupies: " + occupiedCells["X"]);
    console.log("o occupies: " + occupiedCells["O"]);
    setTimeout(() => computerPlays(), 1000);
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

function randomInteger(min, max) {
  let range = max - min + 1;
  return min + Math.floor(Math.random() * range);
}

function XOToPlayerName(whoseTurn) {
  if (whoseTurn === "X") {
    return playerX.name;
  }
  if (whoseTurn === "O") {
    return playerO.name;
  }
}

function XOToPlayerType(whoseTurn) {
  if (whoseTurn === "X") {
    return playerX.type;
  }
  if (whoseTurn === "O") {
    return playerO.type;
  }
}

function resetTimer() {
  startTime = Date.now();
}

function runTimer() {
  setTimeout(() => {
    if (currentState === "gameStarted") {
      let totalMs = Date.now() - startTime; //I continually reference date.now because if I just waited 1000ms and then added 1 totalSeconds, the inaccuracy of setTimeout would eventually become non-negligible
      let totalSeconds = Math.round(totalMs / 1000);
      let seconds = totalSeconds - 60 * Math.floor(totalSeconds / 60);
      let totalMinutes = Math.floor(totalSeconds / 60);
      let minutes = totalMinutes - 60 * Math.floor(totalMinutes / 60);
      let hours = Math.floor(totalMinutes / 60);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (hours < 10) {
        hours = "0" + hours;
      }
      timer.textContent =
        "Time elapsed: " + hours + ":" + minutes + ":" + seconds;
      runTimer();
    }
  }, 100);
}
runTimer();

function computerPlays() {
  if (XOToPlayerType(whoseTurn) === "Computer") {
    let allCells = Array(9);
    let i = 0;
    while (i < 9) {
      allCells[i] = i;
      i++;
    }
    let unoccupiedCells = setDifference(allCells, occupiedCells.all);
    console.log("these cells are unoccupied: " + unoccupiedCells);
    let choiceNum =
      unoccupiedCells[randomInteger(0, unoccupiedCells.length - 1)];
    console.log("computer: I have chosen cell number " + choiceNum);
    let choiceCell = document.getElementById("cell-" + choiceNum);
    playCell(choiceCell);
  }
}

let optionsButton = document.getElementById("options");
let optionsDialog = document.getElementById("optionsDialog");
let selectX = document.getElementsByTagName("select")[0];
let selectO = document.getElementsByTagName("select")[1];
let confirmButton = document.getElementById("confirmBtn");

optionsButton.addEventListener("click", function onOpen() {
  if (typeof optionsDialog.showModal === "function") {
    optionsDialog.showModal();
  } else {
    alert("The dialog API is not supported by this browser");
  }
});

confirmButton.addEventListener("click", () => {
  playerX.type = selectX.value;
  playerO.type = selectO.value;
  if (playerXNameInput.value.length > 0) {
    playerX.name = playerXNameInput.value;
    playerXNameInput.value = "";
  }
  if (playerONameInput.value.length > 0) {
    playerO.name = playerONameInput.value;
    playerONameInput.value = "";
  }
  playerXWinCount.textContent = playerX.name + "'s wins: " + playerX.winCount
  playerOWinCount.textContent = playerO.name + "'s wins: " + playerO.winCount
  if (currentState==="gameStarted") {
    statusMessage.textContent = XOToPlayerName(whoseTurn) + "'s turn!";
  }
  setTimeout(() => computerPlays(), 1000);
  console.log(
    "Player X is a " +
      playerX.type +
      " with name " +
      playerX.name +
      " and player O is a " +
      playerO.type +
      " with name " +
      playerO.name
  );
});

function flashWinningCells() {
  let winningCells = [];
  for (cell of winningTriple) {
    winningCells.push(document.getElementById("cell-" + cell));
  }
  if (currentState === "gameFinished") {
    if (winningCells[0].style.color!=="pink") {
      for (cell of winningCells) {
        cell.style = "color: pink";
      }
    } else {
      for (cell of winningCells) {
        cell.style = "color: white";
      }
    }
    setTimeout(flashWinningCells, 500)
  } else {
    return;
  }
}

function considerCell (cell) {
  if (currentState === "gameStarted" &&
  occupiedCells.all.includes(cellToNumber(cell)) === false) {
    cell.textContent = whoseTurn;
    cell.style = "opacity: .5"
  }
}