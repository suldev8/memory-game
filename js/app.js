'use strict';

// IDs constants
const GAME_CONTAINER = 'game-container';
const WELCOME_SCREEN = 'welcome-screen';
const START_GAME = 'start-game';
const FINISH_GAME = 'finish-game';
const START_BTN = 'start-btn';

// Classes constants
const CONTAINER = 'container';
const DECK = 'deck';
const CARD = 'card';
const OPEN_CARD = 'open';
const SHOW_CARD = 'show';
const MATCH_CARD = 'match';
const NO_MATCH_CARD = 'no-match';
const FONT_AWESOME = 'fa';
const STARS = 'stars';
const EMPTY_STAR = 'fa-star-o';
const FULL_STAR = 'fa-star';
const CHECK_ICON = 'fa-check';
const CHECK_MARK = 'check-mark';
const GREEN_BTN = 'green-btn';
const TIMER = 'timer';
const MOVES_COUNTER = 'moves-counter';
const RESTART = 'restart';

const CARD_TYPES = [
  'fa-anchor',
  'fa-anchor',
  'fa-bicycle',
  'fa-bicycle',
  'fa-bolt',
  'fa-bolt',
  'fa-bomb',
  'fa-bomb',
  'fa-cube',
  'fa-cube',
  'fa-diamond',
  'fa-diamond',
  'fa-leaf',
  'fa-leaf',
  'fa-paper-plane-o',
  'fa-paper-plane-o'
];

// Global variables
let pairOfCards = [];
let openedCardsCounter = 0;
let timerInterval = null;

// Timeout constants
const HIDING_CARDS_DELAY = 2000;
const NO_MATCH_DELAY = 150;
const HIDING_NO_MATCH_DELAY = 600;
const FINISH_GAME_DELAY = 1000;

/*
 *
 * Helper functions
 *
 */

function getTimer() {
  performance.measure('timer', 'start-timer', 'now-timer');
  const measures = performance.getEntriesByName('timer');
  const duration = measures[0].duration;
  performance.clearMeasures('timer');
  return new Date(duration).toISOString().slice(14, -5);
}

function updateScorePanel() {
  const moves = document.querySelector(`.${MOVES_COUNTER}`);
  let movesNumber = Number(moves.innerText);

  moves.innerText = ++movesNumber;

  const stars = document.querySelectorAll(`.${STARS}>li`);

  // Based on the number of moves replace the FULL_STAR with EMPTY_STAR
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

function getScores() {
  const moves = document.querySelector(`.${MOVES_COUNTER}`).innerText;
  const stars = document.querySelector(`.${STARS}`);
  const duration = getTimer();
  return [moves, stars, duration];
}

function resetStars() {
  const stars = document.querySelectorAll(`.${STARS}>li`);
  for (let star of stars) {
    star.firstElementChild.classList.replace(EMPTY_STAR, FULL_STAR);
  }
}

function resetMoves() {
  document.querySelector(`.${MOVES_COUNTER}`).textContent = 0;
}

function hideCards() {
  const cards = document.querySelectorAll(`.${CARD}`);

  // Loop through the cards to remove each of open, show and match classes
  for (let card of cards) {
    card.classList.toggle(OPEN_CARD, false);
    card.classList.toggle(SHOW_CARD, false);
    card.classList.toggle(MATCH_CARD, false);
  }
}

function showCards() {
  const cards = document.querySelectorAll(`.${CARD}`);

  // Loop through the cards to add each of open and show classes
  for (let card of cards) {
    card.classList.toggle(OPEN_CARD, true);
    card.classList.toggle(SHOW_CARD, true);
  }
}

function placeCards(shuffledTypes) {
  const cards = document.querySelector(`.${DECK}`).children;

  // Loop through the cards to replace the old type with the shuffled one
  for (let i = 0; i < cards.length; i++) {
    const oldType = cards[i].firstElementChild.classList[1];
    cards[i].firstElementChild.classList.replace(oldType, shuffledTypes[i]);
  }
}

function createCardsElements(cardTypes) {
  const deck = document.createElement('ul');
  deck.classList.add('deck');

  // Loop through card types to create cards elements
  for (let cardType of cardTypes) {
    const cardElement = document.createElement('li');
    const iElement = document.createElement('i');

    cardElement.classList.add(CARD, OPEN_CARD, SHOW_CARD);
    iElement.classList.add(FONT_AWESOME);
    iElement.classList.add(cardType);

    cardElement.appendChild(iElement);
    deck.appendChild(cardElement);
  }
  const startGame = document.querySelector(`#${START_GAME}`);
  startGame.appendChild(deck);
  startGame.style.display = 'flex';
}

function matchPair(pairOfCards) {
  const [firstCard, secondCard] = pairOfCards;
  const typeOfFirst = firstCard.firstElementChild.classList[1];
  const typeOfSecond = secondCard.firstElementChild.classList[1];

  // Check if the pair of cards match or else no match
  if (typeOfFirst === typeOfSecond) {
    firstCard.classList.add(MATCH_CARD);
    secondCard.classList.add(MATCH_CARD);
    openedCardsCounter += 2;

    // If remain only two cards show them and finish the game
    if (openedCardsCounter === CARD_TYPES.length - 2) {
      // Remove listeners from deck and restart
      const deck = document.querySelector(`.${DECK}`);
      const restartBtn = document.querySelector(`.${RESTART}`);
      deck.removeEventListener('click', cardsListener);
      restartBtn.removeEventListener('click', restartListener);

      showCards();
      setTimeout(finishGame, FINISH_GAME_DELAY);
      openedCardsCounter = 0;
    }
  } else {
    setTimeout(() => {
      firstCard.classList.add(NO_MATCH_CARD);
      secondCard.classList.add(NO_MATCH_CARD);
    }, NO_MATCH_DELAY);

    setTimeout(() => {
      firstCard.classList.remove(OPEN_CARD, SHOW_CARD, NO_MATCH_CARD);
      secondCard.classList.remove(OPEN_CARD, SHOW_CARD, NO_MATCH_CARD);
    }, HIDING_NO_MATCH_DELAY);
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

/*
 *
 * Event listners functions
 *
 */

function startListener(event) {
  document.querySelector(`#${WELCOME_SCREEN}`).style.display = 'none';
  event.currentTarget.removeEventListener('click', startListener);
  startGame();
}

function cardsListener(event) {
  const { target } = event;
  const { tagName, classList } = target;

  // If the card is not opend yet then add OPEN_CARD and SHOW_CARD classes
  if (tagName.toLowerCase() === 'li' && !classList.contains(OPEN_CARD)) {
    classList.add(OPEN_CARD, SHOW_CARD);
    pairOfCards.push(target);

    // If a pair of cards are opened then match them
    if (pairOfCards.length === 2) {
      matchPair(pairOfCards);
      pairOfCards = [];
      updateScorePanel();
    }
  }
}

function restartListener() {
  // Reset opened cards counter
  openedCardsCounter = 0;

  // Reset Timer and clear marks
  clearInterval(timerInterval);
  document.querySelector(`.${TIMER}`).innerText = '00:00';
  performance.clearMarks();

  // Reset stars and moves counter
  resetStars();
  resetMoves();

  // Hide cards and then shuffle the types and place them
  hideCards();
  const shuffledTypes = shuffle(CARD_TYPES);
  placeCards(shuffledTypes);

  // Show shuffled cards and start playing
  showCards();
  setTimeout(addClickListenerOnCards, HIDING_CARDS_DELAY);
}

function playAgainListener(event) {
  document.querySelector(`#${FINISH_GAME}`).remove();
  document.querySelector(`#${START_GAME}`).style.display = 'flex';
  
  addClickListenerOnRestart();
  restartListener();

  event.currentTarget.removeEventListener('click', playAgainListener);
}

/*
 *
 * Add listeners
 *
 */

function addClickListenerOnCards() {
  performance.mark('start-timer');
  timerInterval = setInterval(function() {
    performance.mark('now-timer');
    const timer = document.querySelector(`.${TIMER}`);
    timer.innerText = getTimer();
  }, 1000);
  hideCards();
  const deck = document.querySelector(`.${DECK}`);
  deck.addEventListener('click', cardsListener);
}

function addClickListenerOnRestart() {
  const restart = document.querySelector(`.${RESTART}`);

  restart.addEventListener('click', restartListener);
}

/*
 *
 * The main functions welcomeScreen, startGame and finishGame
 *
 */

function welcomeScreen() {
  const startBtn = document.querySelector(`#${START_BTN}`);
  startBtn.addEventListener('click', startListener);
}

function startGame() {
  const shuffledTypes = shuffle(CARD_TYPES);

  createCardsElements(shuffledTypes);
  setTimeout(addClickListenerOnCards, HIDING_CARDS_DELAY);
  addClickListenerOnRestart();
}

function finishGame() {
  // Hide the start-game section
  document.querySelector(`#${START_GAME}`).style.display = 'none';

  // Create finish-game container
  const finishContainer = document.createElement('div');
  finishContainer.classList.add(CONTAINER);
  finishContainer.id = 'finish-game';

  // Create congratulations elements
  const checkIcon = document.createElement('i');
  checkIcon.classList.add(FONT_AWESOME, CHECK_ICON, CHECK_MARK);
  const congratsHeading = document.createElement('h2');
  congratsHeading.innerText = 'Congratulations you finshed the game!';

  // Create elements for score details
  const [moves, stars, duration] = getScores();
  const scoresDetails = document.createElement('p');
  scoresDetails.innerHTML = `
  Moves: ${moves}<br>
  ${stars.outerHTML}<br>
  Duration: ${duration}`;

  // Create restart button
  const playAgain = document.createElement('button');
  playAgain.classList.add(GREEN_BTN);
  playAgain.innerText = 'Play again';

  // Append all elements to the finish-game section
  finishContainer.appendChild(checkIcon);
  finishContainer.appendChild(congratsHeading);
  finishContainer.appendChild(scoresDetails);
  finishContainer.appendChild(playAgain);

  // Append finish-game to game-container
  document.querySelector(`#${GAME_CONTAINER}`).appendChild(finishContainer);
  playAgain.addEventListener('click', playAgainListener);
}

// Call the welcomeScreen function
// The first call is here
welcomeScreen();
