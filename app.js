/* eslint-disable consistent-return */
/* eslint-env jquery */

// ============ Main Game settings ============ //
const game = {
  // numberOfPlayers: 1,
  numberOfPlayers: 4,
  userTurn: 0, // Index no. of User
  currentTurn: 2,

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
const characterNames = ['Sir Battleship', 'Mdm Cat', 'Mr Tophat', 'Ms Racecar', 'Mr Moneybag'];
class PlayerHand {
  constructor(playerName) {
    this.hand = [];
    this.money = [];
    // this.properties = { Purple: [{}, {}, {}] };
    this.properties = { };
    this.turn = 1;
    this.playerName = playerName || 'user';
    this.playerId = playerName.toLowerCase().split(' ').join('') || 'user';
  }
}
// ============ Card Movement Functions ============ //

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

const discardCard = (cardID) => {
  addCardTo(game.discardPile, cardID);
  render();
};

const addProperty = (cardID, player) => {
  const { hand, properties } = game.playerHands[player || game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const pickedCard = hand[target];
  // console.log(pickedCard);
  let color = pickedCard.colors[0].split(' ').join('');

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

const createModalBase = (title) => {
  const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
  const $modal = $('<div>').addClass('modalCard').appendTo($modalBack);
  const $header = $('<h3>').text(title).appendTo($modal);
};

const openRejectModal = (cardID) => {
  const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
  const $modal = $('<div>').addClass('modalCard').appendTo($modalBack);

  const $header = $('<p>').text('You don\'t have the neccessary cards to do this action').appendTo($modal);
  function closeModal() { $('.modalBase').remove(); }

  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>').text('Close').appendTo($buttonRow).on('click', () => closeModal());
  $('<button>').text('Use as Money').appendTo($buttonRow).on('click', () => {
    addMoney(cardID);
    closeModal();
  });
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

const openRentModal = (cardID, colors, player) => {
  // check if player has card needed to perform action
  if (player !== game.userTurn) {
    return computerRent(cardID, colors);
  }
  const playerColors = Object.keys(
    game.playerHands[game.currentTurn].properties,
  );

  const { hand, properties } = game.playerHands[player || game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const pickedCard = hand[target];

  createModalBase('Rent');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $choiceContainer = $('<div>').addClass('wildPropChoiceContainer').appendTo($modal);

  // eslint-disable-next-line array-callback-return
  colors.map((cardColor, index, array) => {
    let propertyAvailble = false;
    let setTotal = 0;

    // check if there is property
    for (const playerColor of playerColors) {
      if (cardColor === playerColor) {
        setTotal = calculatePropertyRentValue(game.currentTurn, cardColor);
        propertyAvailble = true;
      }
    }

    const $selectionOption = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer);

    const $choiceDisplay = $('<div>').addClass('wildPropDisplay').appendTo($selectionOption)
      .css('background-color', colorToHex('grey'));

    $('<p>').text(cardColor).appendTo($selectionOption).css('color');

    if (index === array.length - 1) {
      $selectionOption.addClass('last');
    }

    if (propertyAvailble) {
      $choiceDisplay.css('background-color', colorToHex(cardColor));
      $('<p>').addClass('propertyValueDisplay').text(`${setTotal}M`).appendTo($selectionOption);
      $selectionOption.on('click', () => {
        rent(setTotal); // TODO complete function
        closeModal();
        openRentResultModal(); // TODO complete function
      });
    }
  });
  // render options for player to choose
  const $buttonRow = $('<div>').addClass('row').appendTo($modal);

  $('<button>').text('Back').appendTo($buttonRow).on('click', () => closeModal());
  $('<button>').text('Use as Money').appendTo($buttonRow).on('click', () => {
    addMoney(cardID);
    closeModal();
  });
};

const computerRent = (cardID, color) => {
  // get player info
  const { properties } = game.playerHands[game.currentTurn];
  const aviableColors = Object.keys(properties);
  // Check if player has required color

  //  If not, use as money
  discardCard(cardID);
  addTurn();
};

const computerAddHouse = (cardID) => {
  const fullProperties = getOnlyFullProperties(game.currentTurn);
  if (fullProperties.length === 0) {
    return addMoney(cardID);
  }

  const pickedProperty = Math.floor(Math.random() * fullProperties.length);

  return addHouse(cardID, pickedProperty);
};

const computerAddHotel = (cardID) => {
  const fullProperties = getHousedProperties(game.currentTurn);
  if (fullProperties.length === 0) {
    return addMoney(cardID);
  }

  const pickedProperty = Math.floor(Math.random() * fullProperties.length);

  return addHotel(cardID, pickedProperty);
};

const computerAddWildCard = (colors, pickedCard, cardID) => {
  const index = Math.floor(Math.random() * colors.length);
  const pickedColor = colors[index];

  setWildPropCurrentColor(pickedColor, pickedCard);
  addProperty(cardID);
};

const openRentResultModal = () => {};

const openWildCardModal = (cardID, colors) => {
  const { hand, properties } = game.playerHands[game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const pickedCard = hand[target];

  if (game.currentTurn !== game.userTurn) {
    return computerAddWildCard(colors, pickedCard, cardID);
  }

  createModalBase('Use card as...');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $choiceContainer = $('<div>').addClass('wildPropChoiceContainer').appendTo($modal);

  // eslint-disable-next-line array-callback-return
  pickedCard.colors.map((color, index, array) => {
    const $button = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer)
      .on('click', () => {
        setWildPropCurrentColor(color, pickedCard);
        addProperty(cardID);
        closeModal();
      });

    $('<div>').addClass('wildPropDisplay').appendTo($button)
      .css('background-color', colorToHex(color));
    $('<p>').text(color).appendTo($button);
    if (index === array.length - 1) {
      $button.addClass('last');
    }
  });
};

const setWildPropCurrentColor = (color, card) => {
  const rentAmount = cardTypes.property[color.split(' ').join('')].rentAmounts;
  const target = card.colors.indexOf(color);
  card.colors.unshift(...card.colors.splice(target, 1));
  card.rentAmounts.push(...rentAmount);
};

// eslint-disable-next-line consistent-return
const openHouseModal = (cardID, player) => {
  const fullProperties = getOnlyFullProperties(game.currentTurn);
  if (game.currentTurn !== game.userTurn) {
    return computerAddHouse(cardID);
  }

  if (fullProperties.length === 0) {
    return openRejectModal(cardID);
  }

  createModalBase('Add house to...');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $choiceContainer = $('<div>').addClass('wildPropChoiceContainer').appendTo($modal);
  // eslint-disable-next-line array-callback-return
  fullProperties.map((color, index, array) => {
    const $button = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer)
      .on('click', () => {
        addHouse(cardID, color);
        closeModal();
      });

    $('<div>').addClass('wildPropDisplay').appendTo($button)
      .css('background-color', colorToHex(color));
    $('<p>').text(color).appendTo($button);
    if (index === array.length - 1) {
      $button.addClass('last');
    }
  });

  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>').text('Back').appendTo($buttonRow).on('click', () => closeModal());
  $('<button>').text('Use as Money').appendTo($buttonRow).on('click', () => {
    addMoney(cardID);
    closeModal();
  });

  // cardTypes.property[color].rentAmounts.length
};

// eslint-disable-next-line consistent-return
const openHotelModal = (cardID, player) => {
  const fullProperties = getHousedProperties(game.currentTurn);
  if (game.currentTurn !== game.userTurn) {
    return computerAddHotel(cardID);
  }

  if (fullProperties.length === 0) {
    return openRejectModal(cardID);
  }

  createModalBase('Add hotel to...');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $choiceContainer = $('<div>').addClass('wildPropChoiceContainer').appendTo($modal);
  // eslint-disable-next-line array-callback-return
  fullProperties.map((color, index, array) => {
    const $button = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer)
      .on('click', () => {
        addHotel(cardID, color);
        closeModal();
      });

    $('<div>').addClass('wildPropDisplay').appendTo($button)
      .css('background-color', colorToHex(color));
    $('<p>').text(color).appendTo($button);
    if (index === array.length - 1) {
      $button.addClass('last');
    }
  });

  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>').text('Back').appendTo($buttonRow).on('click', () => closeModal());
  $('<button>').text('Use as Money').appendTo($buttonRow).on('click', () => {
    addMoney(cardID);
    closeModal();
  });

  // cardTypes.property[color].rentAmounts.length
};

// ============ Calculate Fullsets ============ //

const getFullProperties = (player) => {
  const { properties } = game.playerHands[player];
  const availableProperties = Object.keys(properties);

  // console.log(properties);
  const propertyColor = [];
  for (const color of availableProperties) {
    propertyColor.push(properties[color][0].colors[0].split(' ').join(''));
  }
  const fullProperties = [];

  for (let i = 0; i < availableProperties.length; i++) {
    if (properties[availableProperties[i]].length >= cardTypes.property[propertyColor[i]].rentAmounts.length) {
      // TODO add fix for condition where it is second set
      fullProperties.push(propertyColor[i]);
    }
  }

  return fullProperties;
};

const getOnlyFullProperties = (player) => {
  const { properties } = game.playerHands[player];
  const availableProperties = Object.keys(properties);
  const propertyColor = [];

  // console.log(properties);
  for (const color of availableProperties) {
    propertyColor.push(properties[color][0].colors[0].split(' ').join(''));
  }
  const fullProperties = [];

  for (let i = 0; i < availableProperties.length; i++) {
    if (properties[availableProperties[i]].length === cardTypes.property[propertyColor[i]].rentAmounts.length) {
      // TODO add fix for condition where it is second set
      fullProperties.push(propertyColor[i]);
    }
  }

  return fullProperties;
};

const getHousedProperties = (player) => {
  const { properties } = game.playerHands[player];
  const availableProperties = Object.keys(properties);
  const propertyColor = [];
  for (const color of availableProperties) {
    propertyColor.push(properties[color][0].colors[0].split(' ').join(''));
  }
  const fullProperties = [];

  for (let i = 0; i < availableProperties.length; i++) {
    if (properties[availableProperties[i]].length === cardTypes.property[propertyColor[i]].rentAmounts.length + 1) {
    // TODO add fix for condition where it is second set
      fullProperties.push(propertyColor[i]);
    }
  }

  return fullProperties;
};

// ============ Card Functions ============ //

const rentAny = (color, player) => {};
const rent = (cardID, player) => {
  discardCard(cardID);
  addTurn();
  // TODO add computer function fufilment here
};
const sayNo = (color, player) => {};
const dealBreak = (color, player) => {};
const birthdayParty = (color, player) => {};
const makeSlyDeal = (color, player) => {};
const makeforcedDeal = (color, player) => {};
const collectDebt = (color, player) => {};
// const doubleRent = (color, player) => {};

const addHotel = (cardID, color) => {
  const { hand, properties } = game.playerHands[game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const lastCard = properties[color].length; // Last card of array before adding new card

  const previousRentAmounts = properties[color][lastCard - 1].rentAmounts;
  const newPropTotal = calculatePropertyRentValue(game.currentTurn, color) + 4;

  properties[color].push(...hand.splice(target, 1));
  properties[color][lastCard].rentAmounts.push(...previousRentAmounts, newPropTotal);
  addTurn();
  render();
};

const addHouse = (cardID, color) => {
  const { hand, properties } = game.playerHands[game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const lastCard = properties[color].length; // Last card of array before adding new card

  const previousRentAmounts = properties[color][lastCard - 1].rentAmounts;
  const newPropTotal = calculatePropertyRentValue(game.currentTurn, color) + 3;

  properties[color].push(...hand.splice(target, 1));
  properties[color][lastCard].rentAmounts.push(...previousRentAmounts, newPropTotal);
  addTurn();
  render();
};

const passGo = (cardID, player) => {
  drawCards(game.drawPile, game.playerHands[game.currentTurn].hand, 2);
  discardCard(cardID);
  addTurn();
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
  red: 'Red',
  yellow: 'Yellow',
  blue: 'Blue',
  green: 'Green',
  brown: 'Brown',
  lightBlue: 'Light Blue',
  lightGreen: 'Light Green',
  black: 'Black',
  purple: 'Purple',
  orange: 'Orange',
  allColors() {
    const allColor = [];
    for (const color in this) {
      if (typeof this[color] === 'string') { allColor.push(this[color]); }
    }
    return allColor;
  },
};

const colorToHex = (color) => {
  switch (color) {
    case colors.red: return '#EF5350';
    case colors.yellow: return '#FFD54F';
    case colors.blue: return '#2962FF';
    case colors.green: return '#388E3C';
    case colors.brown: return '#6D4C41';
    case colors.lightBlue: return '#E1F5FE';
    case colors.lightGreen: return '#E0F2F1';
    case colors.black: return '#000000';
    case colors.purple: return '#9C27B0';
    case colors.orange: return '#FFA726';
    case 'grey': return '#b0bec5';
    default: return '#000000';
  }
};

class Card {
  constructor(name, value, action, totalCards) {
    this.name = name;
    this.value = value;
    this.totalCards = totalCards;
    this.action = action;
    this.rentAmounts = [];
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
    this.rentAmounts = rentAmounts || [];
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
  actionCard: {
  //   justSayNo: new Card('Just say no', 4, () => sayNo(), 3),
  //   dealBreaker: new Card('Deal breaker', 5, () => dealBreak(), 2),
  //   itsYourBirthday: new Card('It\'s Your Birthday', 2, () => birthdayParty(), 3),
  //   slyDeal: new Card('Sly deal', 3, () => makeSlyDeal(), 3),
  //   forcedDeal: new Card('Forced deal', 3, () => makeforcedDeal(), 3),
  //   debtCollector: new Card('Debt collector', 3, () => collectDebt(), 3),
  //   doubleTheRent: new Card('Double the Rent', 1, () => doubleRent(), 2),
    hotel: new Card('Hotel', 4, (cardID) => openHotelModal(cardID), 3),
    house: new Card('House', 2, (cardID) => openHouseModal(cardID), 2),
    passGo: new Card('Pass Go', 1, (cardID) => passGo(cardID), 10),
  },
  rent: {
  //   any: new RentCard('Any', 3, 3, colors.allColors()),
    // blueGreen: new RentCard('Blue-Green', 1, 2, [colors.blue, colors.green]),
    orangePurple: new RentCard('Orange-Purple', 1, 2, [colors.orange, colors.purple]),
    // blackLightGreen: new RentCard('Black-Light Green', 1, 2, [colors.black, colors.lightGreen]),
    // brownLightBlue: new RentCard('Brown-Light Blue', 1, 2, [colors.brown, colors.lightBlue]),
    // redYellow: new RentCard('Red-Yellow', 1, 2, [colors.red, colors.yellow]),
  },
  property: {
    Orange: new PropertyCard('Orange', 2, 3, [colors.orange], [1, 3, 5], ['Bow Street', 'Marlborough Street', 'Vine Street']),
    // Blue: new PropertyCard('Blue', 4, 2, [colors.blue], [3, 8], ['Park Lane', 'Mayfair']),
    // Green: new PropertyCard('Green', 4, 3, [colors.green], [2, 4, 7], ['Regent Street', 'Oxford Street', 'Bond Street']),
    // Red: new PropertyCard('Red', 3, 3, [colors.red], [2, 3, 6], ['Strand', 'Fleet Street', 'Trafalgar Square']),
    // Yellow: new PropertyCard('Yellow', 2, 3, [colors.yellow], [2, 4, 6], ['Coverntry Street', 'Leicester Square', 'Piccadilly']),
    Purple: new PropertyCard('Purple', 2, 3, [colors.purple], [1, 2, 4], ['Pall Mall', 'Whitehall', "Northumrl'd Avenue"]),
    // Black: new PropertyCard('Black', 2, 4, [colors.black], [1, 2, 3, 4], ['Marylebone Station', 'Fenchurch St. Station', 'Liverpool St. Station', "King's Cross Station"]),
    // Brown: new PropertyCard('Brown', 1, 2, [colors.brown], [1, 2], ['Old Kent Road', 'Whitechapel Road']),
    // LightGreen: new PropertyCard('Light Green', 2, 2, [colors.lightGreen], [1, 2], ['Electric Company', 'Water Works']),
    // LightBlue: new PropertyCard('Light Blue', 1, 3, [colors.lightBlue], [1, 2, 3], ['Euston Road', 'The Angel Islington', 'Pentonville Road']),
    // any: new PropertyCard('Any', 0, 2, [...colors.allColors()]),
    brownLightBlue: new PropertyCard('Brown-Light Blue', 1, 1, [colors.brown, colors.lightBlue]),
    blackLightBlue: new PropertyCard('Black-Light Blue', 4, 1, [colors.black, colors.lightBlue]),
    orangePurple: new PropertyCard('Orange-Purple', 2, 2, [colors.orange, colors.purple]),
    redYellow: new PropertyCard('Red-Yellow', 3, 2, [colors.yellow, colors.red]),
    blueGreen: new PropertyCard('Blue-Green', 4, 1, [colors.green, colors.blue]),
    greenBlack: new PropertyCard('Green-Black', 4, 1, [colors.green, colors.black]),
    blackLightGreen: new PropertyCard('Black-Light Green', 2, 1, [colors.lightGreen, colors.black]),
  },
};

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
  const { numberOfPlayers, currentTurn, userTurn } = game;

  if (currentTurn === numberOfPlayers - 1) {
    currentTurn = 0;
  } else {
    currentTurn++;
  }
  while (currentTurn !== userTurn) {
    if (game.playerHands[currentTurn] === 1) {
      drawCards(game.drawPile, game.playerHands[currentTurn].hand);
    }
    computerTurn(currentTurn);
  }
};

const createPlayerHands = (amount) => {
  for (let i = 0; i < amount; i++) {
    const randomName = characterNames.splice(Math.floor(Math.random() * characterNames.length), 1);
    // game.playerHands.push(new PlayerHand(`player${i}`));
    game.playerHands.push(new PlayerHand(...randomName));
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
  for (let i = 0; i < game.numberOfPlayers; i++) {
    if (i !== game.userTurn) {
      renderOtherPlayerField(i);
    }
  }
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

function computerTurn(player) {
  const { hand } = game.playerHands[player];
  const randomCard = Math.floor(Math.random() * hand.length);
  // console.log('card index', randomCard);
  const pickedCard = hand[randomCard];

  // console.log(pickedCard);
  // console.log(`Player ${player} played, ${pickedCard.name}`);
  pickedCard.action(pickedCard.id);
  // hand[randomCard].action();
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
      e.stopPropagation();
      $(e.currentTarget).toggleClass('cardToFront');
    });
  if (stackPosition > 0) {
    $cardContainer.css('top', stackPosition * 30)
      .css('position', 'absolute');
  }
};

const renderOtherCard = (parent, cardInfo, hideInfo, stackPosition) => {
  // console.log(parent, cardInfo);
  const $cardContainer = $('<div>')
    .addClass('otherPCard card')
    .attr('id', cardInfo.id)
    .text(`
      ${cardInfo.name} \n ${cardInfo.type}
    `)
    .hover((e) => {
      e.stopPropagation();
      $(e.currentTarget).toggleClass('cardToFront');
    })
    .on('click', () => cardInfo.action(cardInfo.id));

  if (hideInfo) {
    $cardContainer.addClass('card-back');
  }

  if (stackPosition > 0) {
    $cardContainer.css('top', stackPosition * 15)
      .css('position', 'absolute');
  }

  $cardContainer.appendTo($(parent));
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

  // console.log(properties);

  // if (properties.length > 0) {
  for (const color in properties) {
    $('<div>').addClass('propertyCardPile').attr('id', color).appendTo('#userProperty');
    for (let i = 0; i < properties[color].length; i++) {
      renderCard(`#${color}`, properties[color][i], i);
    }
  }
  // }
};

// ============ Render Computer field ============ //
const renderOtherPlayerField = (player) => {
  const { playerId: id } = game.playerHands[player];
  const $parent = $('.otherPlayerFields');

  const $playerField = $('<div>').attr('id', `${id}-field`).addClass('otherField')
    .html(`
    <div class="otherMoneyPile">
      <div id="${id}Money" class="otherCardPile"></div>
        <div class="row">
          <p id="${id}MoneyTotal">Total: 0</p>
        </div>
    </div>

    <div class="otherHand">
      <div id="${id}Hand" class="otherCardPile"></div>
      <div class="row"> </div>
    </div>

  <div class="otherPropertyPile">
    <div id="${id}Property" class="otherCardPile"></div>
    <div class="row"></div>
  </div>
  `);

  $playerField.appendTo($parent);
};

const renderOtherPlayerHand = (player) => {
  const { playerId: id, hand, money, properties } = game.playerHands[player];
  $(`#${id}Hand`).children().remove();

  for (const card of hand) {
    renderOtherCard(`#${id}Hand`, card, true);
  }
};
const renderOtherPlayerMoney = (player) => {
  const { playerId: id, money } = game.playerHands[player];
  $(`#${id}Money`).children().remove();

  if (money.length > 0) {
    for (const card of money) {
      renderOtherCard(`#${id}Money`, card);
    }
  }
};

const renderOtherPlayerProperty = (player) => {
  const { playerId: id, properties } = game.playerHands[player];
  $(`#${id}Property`).children().remove();

  for (const color in properties) {
    $('<div>').addClass('propertyCardPile').attr('id', `${id}${color}`).appendTo(`#${id}Property`);
    for (let i = 0; i < properties[color].length; i++) {
      renderOtherCard(`#${id}${color}`, properties[color][i], false, i);
    }
  }
};

const calculateTotalMoney = (player) => {
  const { money } = game.playerHands[player];
  let total = 0;
  for (const card of money) {
    total += card.value;
  }

  return total;
};

const calculateTotalPropertyValue = (player) => {
  const { properties } = game.playerHands[player];
  let total = 0;
  for (const key in properties) {
    for (const card of properties[key]) {
      total += card.value;
    }
  }

  return total;
};

const calculatePropertyRentValue = (player, color) => {
  const { properties } = game.playerHands[player];
  const colorKey = color.split(' ').join();
  // const fullsetLength = properties[colorKey].rentAmounts.length;
  const propertyCount = properties[colorKey].length;
  const lastCard = propertyCount - 1;
  let total = 0;

  // if (propertyCount <= fullsetLength) {
  total = properties[colorKey][lastCard].rentAmounts[propertyCount - 1];
  // } else {
  //   total = properties[color].rentAmount[fullsetLength - 1] + ;
  // }

  // TODO return to this if any change require after add house or hotel

  return total;
};

// console.log(game.playerHands[0])

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

  for (let i = 0; i < game.numberOfPlayers; i++) {
    if (i !== game.userTurn) {
      renderOtherPlayerHand(i);
      renderOtherPlayerProperty(i);
      renderOtherPlayerMoney(i);
    }
  }
}

const main = () => {
  setUpGame();
  renderCardPile();
  renderPlayerHand();
  for (let i = 0; i < game.numberOfPlayers; i++) {
    if (i !== game.userTurn) {
      renderOtherPlayerHand(i);
    }
  }
  $('#endTurn').on('click', () => endTurn());
  console.log(game);
  computerTurn(2);
};

$(main);
