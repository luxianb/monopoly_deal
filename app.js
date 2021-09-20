/* eslint-env jquery */

// ============ Main Game settings ============ //
const game = {
  numberOfPlayers: 2,
  userTurn: 0, // Index no. of User
  currentTurn: 0,

  drawPile: [],
  discardPile: [],

  playerHands: [],
};

const modal = {
  display: true,
  title: '',
  content: '',
  cardID: '',
  function1: null,
  function2: null,
};

// ============ Classes ============ //
class PlayerHand {
  constructor(playerId) {
    this.hand = [];
    this.money = [];
    this.properties = {};
    this.turn = 1;
    this.playerId = playerId || '';
  }
}

// ============ Card Functions settings ============ //
const rentAny = (color, player) => {};
const rent = (color, player) => {};
const sayNo = (color, player) => {};
const dealBreak = (color, player) => {};
const birthdayParty = (color, player) => {};
const makeSlyDeal = (color, player) => {};
const makeforcedDeal = (color, player) => {};
const collectDebt = (color, player) => {};
const doubleRent = (color, player) => {};
const addHotel = (color, player) => {};
const addHouse = (color, player) => {};
const passGo = (color, player) => {};

const addCardTo = (location, cardID, player) => {
  const { hand } = game.playerHands[player || game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);

  location.push(...hand.splice(target, 1));
  // render();
};

const addMoney = (cardID) => {
  const { money } = game.playerHands[game.currentTurn];
  addCardTo(money, cardID);
  render();
  addTurn();
};

// const addProperty = (cardID) => {
//   const { properties } = game.playerHands[game.currentTurn];
//   addCardTo(properties, cardID);
//   render();
//   addTurn();
// };

const addProperty = (cardID, player) => {
  const { hand, properties } = game.playerHands[player || game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const pickedCard = hand[target];
  console.log(pickedCard);
  let color = pickedCard.colors[0];

  if (typeof properties[color] === 'undefined') {
    properties[color] = [];
  }
  if (properties[color].length === pickedCard.rentAmounts.length) {
    color = `${color}1`;
    if (typeof properties.color === 'undefined') {
      properties[color] = [];
    }
  }
  properties[color].push(...hand.splice(target, 1));
  render();
  addTurn();
};

const openRentAnyModal = (title, content) => {
  const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
  const $modal = $('<div>').addClass('modalCard').html(`
  `);
  // ${title && (<h1>${title}</h1>)}
  // <p>${content}</p>
  const $header = $('<h3>').text('Something').appendTo($modal);
  const $content = $('<p>').text('Something').appendTo($modal);
  const $row = $('<div>').addClass('row').appendTo($modal);

  $('<button>').text('Use as Money').on('click', () => addMoney())
    .appendTo($row);
  $('<button>').text('Rent').on('click', () => rentAny())
    .appendTo($row);

  $modal.appendTo($modalBack);
};

const openRentModal = () => {};
const openWildCardModal = (cardID) => {
  const { hand, properties } = game.playerHands[player || game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const pickedCard = hand[target];

  const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
  const $modal = $('<div>').addClass('modalCard');
  const $header = $('<h3>').text('Use card as...').appendTo($modal);

  for (const color of pickedCard.colors) {

  }
};

// ============ Computer Moves ============ //
// const computerPayRent = (rentAmount, target) => {
//   // loop through cash amount
//   const { money, properties } = game.playerHands[target];
//   money.sort((a, b) => a - b);
//   let currentTotal = 0;
//   const pickedCards = [];

//   if (rentAmount > calculateTotalMoney(target)) {
//     while (currentTotal < rentAmount || money.length > 0) {
//       const pickedCard = money.pop();

//       pickedCards.push(pickedCard);
//       currentTotal += pickedCard.value;
//     }
//   } else {
//     pickedCards.push(...money);

//     if (rentAmount > calculateTotalMoney(target) + calculatePropertyValue(target)) {

//     }
//   }
// add amount to a temp array to be passed to the player when conditon fufiled
// };

// ============ Card Definitions ============ //
const colors = {
  red: 'red',
  yellow: 'yellow',
  blue: 'blue',
  green: 'green',
  brown: 'brown',
  lightBlue: 'lightBlue',
  lightGreen: 'lightGreen',
  black: 'black',
  purple: 'purple',
  orange: 'orange',
  allColors() {
    const allColor = [];
    for (const color in this) {
      if (typeof this[color] === 'string') { allColor.push(this[color]); }
    }
    return allColor;
  },
};

class Card {
  constructor(name, value, action, totalCards) {
    this.name = name;
    this.value = value;
    this.totalCards = totalCards;
    this.action = action;
  }
}

class MoneyCard extends Card {
  constructor(name, value, totalCards) {
    super();
    this.name = name;
    this.value = value;
    this.totalCards = totalCards;
    this.action = (cardID) => addMoney(cardID);
  }
}

class RentCard extends Card {
  constructor(name, value, totalCards, color) {
    super();
    this.name = `${name} Rent`;
    this.value = value;
    this.totalCards = totalCards;
    this.colors = color;
    this.action = (cardID) => {
      if (this.name === 'Any') {
        openRentAnyModal(cardID, this.colors);
      } else {
        openRentModal(cardID, this.colors);
      }
    };
  }
}

class PropertyCard extends Card {
  constructor(name, value, totalCards, color, rentAmounts, locationNames) {
    super();
    this.name = `${name} Property`;
    this.value = value;
    this.totalCards = totalCards;
    this.colors = color;
    this.rentAmounts = rentAmounts;
    this.locationNames = locationNames || [];
    this.action = (cardID) => {
      if (this.colors.length > 1) {
        openWildCardModal(cardID, this.colors);
      } else {
        addProperty(cardID);
      }
    };
  }
}

const cardTypes = {
  // money: {
  //   '1M': new MoneyCard('1M', 1, 6),
  //   '2M': new MoneyCard('2M', 2, 2),
  //   '3M': new MoneyCard('3M', 3, 3),
  //   '4M': new MoneyCard('4M', 4, 3),
  //   '5M': new MoneyCard('5M', 5, 2),
  //   '10M': new MoneyCard('10M', 10, 1),
  // },
  // actionCard: {
  //   justSayNo: new Card('Just say no', 4, () => sayNo(), 3),
  //   dealBreaker: new Card('Deal breaker', 5, () => dealBreak(), 2),
  //   itsYourBirthday: new Card('It\'s Your Birthday', 2, () => birthdayParty(), 3),
  //   slyDeal: new Card('Sly deal', 3, () => makeSlyDeal(), 3),
  //   forcedDeal: new Card('Forced deal', 3, () => makeforcedDeal(), 3),
  //   debtCollector: new Card('Debt collector', 3, () => collectDebt(), 3),
  //   doubleTheRent: new Card('Double the Rent', 1, () => doubleRent(), 2),
  //   hotel: new Card('Hotel', 4, () => addHotel(), 3),
  //   house: new Card('House', 2, () => addHouse(), 2),
  //   passGo: new Card('Pass Go', 1, () => passGo(), 10),
  // },
  // rent: {
  //   any: new RentCard('Any', 3, 3, colors.allColors()),
  //   blueGreen: new RentCard('Blue-Green', 1, 2, [colors.blue, colors.green]),
  //   orangePurple: new RentCard('Orange-Purple', 1, 2, [colors.orange, colors.purple]),
  //   blackLightGreen: new RentCard('Black-Light Green', 1, 2, [colors.black, colors.lightGreen]),
  //   brownLightBlue: new RentCard('Brown-Light Blue', 1, 2, [colors.brown, colors.lightBlue]),
  //   redYellow: new RentCard('Red-Yellow', 1, 2, [colors.red, colors.yellow]),
  // },
  property: {
    orange: new PropertyCard('Orange', 2, 3, [colors.orange], [1, 3, 5], ['Bow Street', 'Marlborough Street', 'Vine Street']),
    blue: new PropertyCard('Blue', 4, 2, [colors.blue], [3, 8], ['Park Lane', 'Mayfair']),
    green: new PropertyCard('Green', 4, 3, [colors.green], [2, 4, 7], ['Regent Street', 'Oxford Street', 'Bond Street']),
    red: new PropertyCard('Red', 3, 3, [colors.red], [2, 3, 6], ['Strand', 'Fleet Street', 'Trafalgar Square']),
    yellow: new PropertyCard('Yellow', 2, 3, [colors.yellow], [2, 4, 6], ['Coverntry Street', 'Leicester Square', 'Piccadilly']),
    // purple: new PropertyCard('Purple', 2, 3, [colors.purple], [1, 2, 4], ['Pall Mall', 'Whitehall', "Northumrl'd Avenue"]),
    // black: new PropertyCard('Black', 2, 4, [colors.black], [1, 2, 3, 4], ['Marylebone Station', 'Fenchurch St. Station', 'Liverpool St. Station', "King's Cross Station"]),
    // brown: new PropertyCard('Brown', 1, 2, [colors.brown], [1, 2], ['Old Kent Road', 'Whitechapel Road']),
    // lightGreen: new PropertyCard('Light Green', 2, 2, [colors.lightGreen], [1, 2], ['Electric Company', 'Water Works']),
    // lightBlue: new PropertyCard('Light Blue', 1, 3, [colors.lightBlue], [1, 2, 3], ['Euston Road', 'The Angel Islington', 'Pentonville Road']),
    // any: new PropertyCard('Any', 0, 2, [...colors.allColors()]),
    brownLightBlue: new PropertyCard('Brown-Light Blue', 1, 1, [colors.brown, colors.lightBlue]),
    // blackLightBlue: new PropertyCard('Black-Light Blue', 4, 1, [colors.black, colors.lightBlue]),
    // orangePurple: new PropertyCard('Orange-Purple', 2, 2, [colors.orange, colors.purple]),
    // redYellow: new PropertyCard('Red-Yellow', 3, 2, [colors.yellow, colors.red]),
    // blueGreen: new PropertyCard('Blue-Green', 4, 1, [colors.green, colors.blue]),
    // greenBlack: new PropertyCard('Green-Black', 4, 1, [colors.green, colors.black]),
    // blackLightGreen: new PropertyCard('Black-Light Green', 2, 1, [colors.lightGreen, colors.black]),
  },
};

// const cardTypes = {
//   money: {
//     '1M': { value: 1, action: (id) => addMoney(id), totalCards: 6 },
//     '2M': { value: 2, action: (id) => addMoney(id), totalCards: 2 },
//     '3M': { value: 3, action: (id) => addMoney(id), totalCards: 3 },
//     '4M': { value: 4, action: (id) => addMoney(id), totalCards: 3 },
//     '5M': { value: 5, action: (id) => addMoney(id), totalCards: 2 },
//     '10M': { value: 10, action: (id) => addMoney(id), totalCards: 1 },
//   },
//   actionCard: {
//     justSayNo: { value: 4, action: sayNo(), totalCards: 3 },
//     dealBreaker: { value: 5, action: dealBreak(), totalCards: 2 },
//     itsYourBirthday: { value: 2, action: birthdayParty(), totalCards: 3 },
//     slyDeal: { value: 3, action: makeSlyDeal(), totalCards: 3 },
//     forcedDeal: { value: 3, action: makeforcedDeal(), totalCards: 3 },
//     debtCollector: { value: 3, action: collectDebt(), totalCards: 3 },
//     doubleTheRent: { value: 1, action: doubleRent(), totalCards: 2 },
//     hotel: { value: 4, action: addHotel(), totalCards: 3 },
//     house: { value: 3, action: addHouse(), totalCards: 2 },
//     passGo: { value: 1, action: passGo(), totalCards: 10 },
//   },
//   rent: {
//     any: { value: 3, action: rentAny(), totalCards: 3 },
//     blueGreen: { value: 1, action: rent(), totalCards: 2 },
//     orangePurple: { value: 1, action: rent(), totalCards: 2 },
//     blackLightGreen: { value: 1, action: rent(), totalCards: 2 },
//     brownLightBlue: { value: 1, action: rent(), totalCards: 2 },
//     redYellow: { value: 1, action: rent(), totalCards: 2 },
//   },
//   property: {
//     orange: { value: 2, action: (id) => addProperty(id), totalCards: 3, rentAmt: [1, 3, 5], names: ['Bow Street', 'Marlborough Street', 'Vine Street'] },
//     blue: { value: 4, action: (id) => addProperty(id), totalCards: 2, rentAmt: [3, 8], names: ['Park Lane', 'Mayfair'] },
//     green: { value: 4, action: (id) => addProperty(id), otalCards: 3, rentAmt: [2, 4, 7], names: ['Regent Street', 'Oxford Street', 'Bond Street'] },
//     red: { value: 3, action: (id) => addProperty(id), totalCards: 3, rentAmt: [2, 3, 6], names: ['Strand', 'Fleet Street', 'Trafalgar Square'] },
//     yellow: { value: 3, action: (id) => addProperty(id), totalCards: 3, rentAmt: [2, 4, 6], names: ['Coverntry Street', 'Leicester Square', 'Piccadilly'] },
//     purple: { value: 2, action: (id) => addProperty(id), totalCards: 3, rentAmt: [1, 2, 4], names: ['Pall Mall', 'Whitehall', "Northumrl'd Avenue"] },
//     black: { value: 2, action: (id) => addProperty(id), totalCards: 4, rentAmt: [1, 2, 3, 4], names: ['Marylebone Station', 'Fenchurch St. Station', 'Liverpool St. Station', "King's Cross Station"] },
//     brown: { value: 1, action: (id) => addProperty(id), totalCards: 2, rentAmt: [1, 2], names: ['Old Kent Road', 'Whitechapel Road'] },
//     lightGreen: { value: 2, action: (id) => addProperty(id), totalCards: 2, rentAmt: [1, 2], names: ['Electric Company', 'Water Works'] },
//     lightBlue: { value: 1, action: (id) => addProperty(id), totalCards: 3, rentAmt: [1, 2, 3], names: ['Euston Road', 'The Angel Islington', 'Pentonville Road'] },
//   },
//   wildProperty: {
//     any: { value: 0, totalCards: 2, colors: [...colors.allColors()], usedAs: '' },
//     brownLightBlue: { value: 1, colors: [colors.brown, colors.lightBlue], totalCards: 1, usedAs: '' },
//     blackLightBlue: { value: 4, colors: [colors.black, colors.lightBlue], totalCards: 1, usedAs: '' },
//     orangePurple: { value: 2, colors: [colors.orange, colors.purple], totalCards: 2, usedAs: '' },
//     redYellow: { value: 3, colors: [colors.yellow, colors.red], totalCards: 2, usedAs: '' },
//     blueGreen: { value: 4, colors: [colors.green, colors.blue], totalCards: 1, usedAs: '' },
//     greenBlack: { value: 4, colors: [colors.green, colors.black], totalCards: 1, usedAs: '' },
//     blackLightGreen: { value: 2, colors: [colors.lightGreen, colors.black], totalCards: 1, usedAs: '' },
//   },
// };

// ============ General Functions ============ //
/** @type {() => object[]} */
const constructDeck = () => {
  const deck = [];
  for (const cardType in cardTypes) {
    for (const card in cardTypes[cardType]) {
      const cardInfo = cardTypes[cardType][card];
      const { totalCards, value, action } = cardInfo;

      for (let i = 0; i < totalCards; i++) {
        const cardObj = {};
        deck.push({
          id: `${card}${cardType}${i}`,
          name: card,
          type: cardType,
          ...cardInfo,
          tags: [],
        });
      }
    }
  }

  return deck;
};

/** @type {(deck: Array) => Array} */
const shuffleDeck = (deck) => {
  const oldDeck = deck; const
    shuffledDeck = [];

  while (oldDeck.length > 0) {
    const randomCard = Math.floor(Math.random() * oldDeck.length);

    shuffledDeck.push(...oldDeck.splice(randomCard, 1));
  }

  return shuffledDeck;
};

/** @type {(source: Array, hand: Array, amount: number) => void} */
const drawCards = (source, hand, amount) => {
  for (let i = 0; i < amount; i++) {
    hand.push(source.pop());
  }
  // eslint-disable-next-line no-use-before-define
  render();
};

/** @type {() => void} */
const endTurn = () => {
  const { numberOfPlayers, currentTurn } = game;

  if (currentTurn === numberOfPlayers - 1) {
    currentTurn = 0;
  } else {
    currentTurn++;
  }
};

const createPlayerHands = (amount) => {
  for (let i = 0; i < amount; i++) {
    game.playerHands.push(new PlayerHand(`player${i}`));
  }
};

const initialiseHands = (hands) => {
  for (let i = 0; i < 5; i++) {
    for (let i2 = 0; i2 < hands; i2++) {
      drawCards(game.drawPile, game.playerHands[i2].hand, 1);
    }
  }
};

const randomizeUserTurn = () => {
  game.userTurn = Math.floor(Math.random * game.numberOfPlayers);
};

const setUpGame = () => {
  createPlayerHands(game.numberOfPlayers);
  game.drawPile.push(...shuffleDeck(constructDeck()));
  // randomizeUserTurn()
  initialiseHands(game.numberOfPlayers);
  // renderCards()
};

function addTurn() {
  let playerTurn = game.playerHands[game.currentTurn].turn;
  if (playerTurn === 3) {
    playerTurn = 1;
    endTurn();
  } else {
    playerTurn++;
  }
}

// ============ Render Functions ============ //
const renderCard = (parent, cardInfo, stackPosition) => {
  const $cardContainer = $('<div>')
    .addClass('card')
    .attr('id', cardInfo.id)
    .appendTo(parent)
    .on('click', () => cardInfo.action(cardInfo.id))
    .text(`${cardInfo.name} \n ${cardInfo.type}`)
    .hover((e) => {
      // e.stopPropagation();
      e.currentTarget.toggleClass('cardToFront');
    });
  if (stackPosition > 0) {
    $cardContainer.css('top', stackPosition * 30)
      .css('position', 'absolute');
  }
  // if (cardInfo) {
  //   $cardContainer
  // }
};

const renderPileCard = (parent, deck, position) => {
  const $cardContainer = $('<div>')
    .addClass('card').addClass('card-back').addClass('piled-card')
    .appendTo(parent)
    .css('left', position * 0.25)
    .text(deck.length)
    .on('click', () => drawCards(deck, game.playerHands[game.userTurn].hand, 1));
    // .on('click', () => cardFunction())
};

const renderPlayerHand = () => {
  const playerHand = game.playerHands[game.userTurn].hand;
  $('#userHand').children().remove();
  for (const card of playerHand) {
    renderCard('#userHand', card);
  }
};

const renderMoney = () => {
  const { money } = game.playerHands[game.userTurn];
  $('#userMoney').children().remove();

  if (money.length > 0) {
    for (const card of money) {
      renderCard('#userMoney', card);
    }
  }
};

const renderMoneyTotal = () => {
  $('#userMoneyTotal').text(`Total: ${calculateTotalMoney(game.userTurn)}`);
};

const renderProperty = () => {
  const { properties } = game.playerHands[game.userTurn];
  $('#userProperty').children().remove();

  console.log(properties);

  // if (properties.length > 0) {
  for (const color in properties) {
    $('<div>').addClass('propertyCardPile').attr('id', color).appendTo('#userProperty');
    for (let i = 0; i < properties[color].length; i++) {
      renderCard(`#${color}`, properties[color][i], i);
    }
  }
  // }
};

const calculateTotalMoney = (player) => {
  const { money } = game.playerHands[player];
  let total = 0;
  for (const card of money) {
    total += card.value;
  }

  return total;
};

const calculatePropertyValue = (player) => {
  const { properties } = game.playerHands[player];
  let total = 0;
  for (const key in properties) {
    for (const card in properties[key]) {
      total += card.value;
    }
  }

  return total;
};

const renderCardPile = () => {
  $('#drawPile').children().remove();
  $('#discardPile').children().remove();
  for (let i = 0; i < game.drawPile.length; i++) {
    const element = game.drawPile[i];
    renderPileCard('#drawPile', game.drawPile, i);
  }
  for (const card of game.discardPile) {
    renderPileCard('#discardPile', game.discardPile);
  }
};

function render() {
  renderCardPile();
  renderPlayerHand();
  renderMoney();
  renderProperty();
  renderMoneyTotal();
}

const main = () => {
  setUpGame();
  renderCardPile();
  renderPlayerHand();
  console.log(game);
  // openRentAnyModal();
};

$(main);
