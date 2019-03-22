/* eslint-disable no-console */

//Classes constants
const CONTAINER = "container";
const CARD = "card";
const OPEN_CARD = "open";
const SHOW_CARD = "show";
const MATCH_CARD = "match";
const NO_MATCH_CARD = "no-match";
const FONT_AWESOME = "fa";
const EMPTY_STAR = "fa-star-o";
const FULL_STAR = "fa-star";
const CHECK_ICON = "fa-check";
const CHECK_MARK = "check-mark"
const GREEN_BTN = "green-btn"

const CARD_TYPES = [
  "fa-anchor",
  "fa-anchor",
  "fa-bicycle",
  "fa-bicycle",
  "fa-bolt",
  "fa-bolt",
  "fa-bomb",
  "fa-bomb",
  "fa-cube",
  "fa-cube",
  "fa-diamond",
  "fa-diamond",
  "fa-leaf",
  "fa-leaf",
  "fa-paper-plane-o",
  "fa-paper-plane-o"
];

let pairOfCards = [];
let openedCardsCounter = 0;
let timer = null;

//Timeout constants
const HIDING_CARDS_DELAY = 2000;
const NO_MATCH_DELAY = 150;
const HIDING_NO_MATCH_DELAY = 600;
const FINISH_GAME_DELAY = 1000;
/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of OPEN_CARD cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

//Call the main function
main();

function main() {
  const startBtn = document.querySelector("#start-btn");

  startBtn.addEventListener("click", startListener);
}

function startListener(event) {
  document.querySelector("#welcome-screen").style.display = "none";
  event.currentTarget.removeEventListener("click", startListener);
  startGame();
}

function startGame() {
  const shuffledTypes = shuffle(CARD_TYPES);

  createCardsElements(shuffledTypes);
  setTimeout(clickEventOnCards, HIDING_CARDS_DELAY);
  clickEventOnRestart();
}

function createCardsElements(cardTypes) {
  const deck = document.createElement("ul");
  deck.classList.add("deck");
  for (let cardType of cardTypes) {
    const cardElement = document.createElement("li");
    const iElement = document.createElement("i");

    cardElement.classList.add(CARD, OPEN_CARD, SHOW_CARD);
    iElement.classList.add(FONT_AWESOME);
    iElement.classList.add(cardType);

    cardElement.appendChild(iElement);
    deck.appendChild(cardElement);
  }
  const startGame = document.querySelector("#start-game");
  startGame.appendChild(deck);
  startGame.style.display = "flex";
}

function clickEventOnCards() {
  performance.mark('start-timer')
  timer = setInterval(function() {
    performance.mark('now-timer');
    const timer = document.querySelector('.timer');
    timer.innerText = getTimer();
  },1000)

  hideCards();
  const deck = document.querySelector(".deck");
  deck.addEventListener("click", cardsListener);
}

function getTimer() {
  performance.measure("timer","start-timer", "now-timer");
  const measures = performance.getEntriesByName("timer");
  const duration = measures[0].duration;
  performance.clearMeasures("timer");
  return new Date(duration).toISOString().slice(14, -5);
}

function cardsListener(event) {
  const { target } = event;
  const { tagName, classList } = target;

  if (tagName.toLowerCase() === "li" && !classList.contains(OPEN_CARD)) {
    classList.add(OPEN_CARD, SHOW_CARD);
    pairOfCards.push(target);
    if (pairOfCards.length === 2) {
      matchPair(pairOfCards);
      pairOfCards = [];
      updateScorePanel();
    }
  }
}
function matchPair(pairOfCards) {
  const [firstCard, secondCard] = pairOfCards;
  const typeOfFirst = firstCard.firstElementChild.classList[1];
  const typeOfSecond = secondCard.firstElementChild.classList[1];

  //check if the pair of cards match or else no match
  if (typeOfFirst === typeOfSecond) {
    firstCard.classList.add(MATCH_CARD);
    secondCard.classList.add(MATCH_CARD);
    openedCardsCounter += 2;

    if (openedCardsCounter === CARD_TYPES.length - 2) {
      showCards();
      setTimeout(finishGame, FINISH_GAME_DELAY);
      openedCardsCounter = 0;
    }
  } else {
    setTimeout(function() {
      firstCard.classList.add(NO_MATCH_CARD);
      secondCard.classList.add(NO_MATCH_CARD);
    }, NO_MATCH_DELAY);

    setTimeout(function() {
      firstCard.classList.remove(OPEN_CARD, SHOW_CARD, NO_MATCH_CARD);
      secondCard.classList.remove(OPEN_CARD, SHOW_CARD, NO_MATCH_CARD);
    }, HIDING_NO_MATCH_DELAY);
  }
}

function updateScorePanel() {
  const moves = document.querySelector(".moves-counter");
  let movesNumber = Number(moves.innerText);

  moves.innerText = ++movesNumber;
  const stars = document.querySelectorAll(".stars>li");

  switch (movesNumber) {
    case 10:
      stars[2].firstElementChild.classList.replace(FULL_STAR, EMPTY_STAR);
      break;
    case 20:
      stars[1].firstElementChild.classList.replace(FULL_STAR, EMPTY_STAR);
      break;
    case 30:
      stars[0].firstElementChild.classList.replace(FULL_STAR, EMPTY_STAR);
      break;
  }
}

function clickEventOnRestart() {
  const restart = document.querySelector(".restart");

  restart.addEventListener("click", restartListener);
}

function restartListener() {
  
  //reset opened cards counter
  openedCardsCounter = 0;
  
  // reset Timer and clear marks
  clearInterval(timer);
  document.querySelector('.timer').innerText = "00:00";
  performance.clearMarks();

  // reset stars and moves counter
  resetStars();
  resetMoves();

  //hide cards and then shuffle the types and place them
  hideCards();
  const shuffledTypes = shuffle(CARD_TYPES);
  placeCards(shuffledTypes);

  //show shuffled cards and start playing 
  showCards();
  setTimeout(clickEventOnCards, HIDING_CARDS_DELAY);
}

function finishGame() {
  //hide the start-game section
  document.querySelector("#start-game").style.display = "none";

  //create finish-game section
  const finishSection = document.createElement("section");
  finishSection.classList.add(CONTAINER);
  finishSection.id = "finish-game";

  //create congratulations elements
  const checkIcon = document.createElement("i");
  checkIcon.classList.add(FONT_AWESOME, CHECK_ICON, CHECK_MARK);
  const congratsHeading = document.createElement("h2");
  congratsHeading.innerText = "Congratulations you finshed the game!";

  //create elements for score details
  const [moves, stars, duration] = getScores();
  const scoresDetails = document.createElement("p");
  scoresDetails.innerHTML = `moves: ${moves}<br>
  ${stars.outerHTML}<br>
  Duratoin: ${duration}`;

  //Create restart button
  const playAgain = document.createElement('button');
  playAgain.classList.add(GREEN_BTN);
  playAgain.innerText = "Play again"

  //append all elements to the finish-game section
  finishSection.appendChild(checkIcon);
  finishSection.appendChild(congratsHeading);
  finishSection.appendChild(scoresDetails);
  finishSection.appendChild(playAgain);
  
  document.querySelector('#game-container').appendChild(finishSection);
  playAgain.addEventListener("click", playAgainEventListener);
}

function playAgainEventListener() {
  document.querySelector('#finish-game').remove();
  document.querySelector('#start-game').style.display = "flex"
  restartListener();
}

function getScores() {
  const moves = document.querySelector(".moves-counter").innerText;
  const stars = document.querySelector(".stars");
  const duration = getTimer();
  return [moves, stars, duration];
}

function resetStars() {
  const stars = document.querySelectorAll(".stars>li");
  for (let star of stars) {
    star.firstElementChild.classList.replace(EMPTY_STAR, FULL_STAR);
  }
}

function resetMoves() {
  document.querySelector(".moves-counter").textContent = 0;
}

function hideCards() {
  const cards = document.querySelectorAll(".card");

  //Loop thrugh the cards remove each of open, show and match classes
  for (let card of cards) {
    card.classList.toggle(OPEN_CARD, false);
    card.classList.toggle(SHOW_CARD, false);
    card.classList.toggle(MATCH_CARD, false);
  }
}

function showCards() {
  const cards = document.querySelectorAll(".card");

  for (let card of cards) {
    card.classList.toggle(OPEN_CARD, true);
    card.classList.toggle(SHOW_CARD, true);
  }
}

function placeCards(shuffledTypes) {
  const cards = document.querySelector(".deck").children;
  for (let i = 0; i < cards.length; i++) {
    const oldType = cards[i].firstElementChild.classList[1];
    cards[i].firstElementChild.classList.replace(oldType, shuffledTypes[i]);
  }
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
/* function createCardsElements(cards) {
  let start = performance.now();
  const cardsList = document.createElement('ul');
  cardsList.classList.add('deck');
  let counter = 0;
  createCards(cards);
  function createCards(cards) {
    const cardElement = document.createElement('li');
    const iElement = document.createElement('i');
    
    cardElement.classList.add('card');
    iElement.classList.add('fa');
    iElement.classList.add(cards[counter]);
    counter++
    
    cardsList.appendChild(cardElement);
    cardElement.appendChild(iElement);
    if(counter < cards.length) {
      setTimeout(createCards(cards), 0);
    } 
    else {
      const startGame = document.querySelector('.start-game');
      startGame.appendChild(cardsList);
      startGame.style.display = "flex";
      let end = performance.now();
      console.log(end-start);
    }
  }
  
} */
