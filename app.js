/* eslint-disable consistent-return */
/* eslint-env jquery */

const DEBUG = false;

// ============ Main Game settings ============ //
const game = {
  // numberOfPlayers: 1,
  numberOfPlayers: 4,
  userTurn: 0, // Index no. of User
  currentTurn: 0,
  setsToWin: 3,
  log: '',

  drawPile: [],
  discardPile: [],

  playerHands: [],

};

// ============ Classes ============ //
const characterNames = ['Sir Battleship', 'Mdm Cat', 'Mr Tophat', 'Ms Racecar', 'Mr Moneybag'];
class PlayerHand {
  constructor(playerName) {
    this.hand = [];
    this.money = [];
    this.properties = {};

    this.turn = 1;
    this.playerName = playerName;
    this.playerId = removeEmptySpace(playerName.toLowerCase());
  }
}
// ============ Card Movement Functions ============ //

const addCardTo = (location, cardID, player) => {
  const { hand } = game.playerHands[player || game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);

  location.push(...hand.splice(target, 1));
};

const addMoney = (cardID) => {
  const { money } = game.playerHands[game.currentTurn];
  addCardTo(money, cardID);
  render();
  addTurn();
};

const addProperty = (cardID) => {
  const { hand, properties } = game.playerHands[game.currentTurn];
  const target = hand.map((e) => e.id).indexOf(cardID);
  const pickedCard = hand[target];

  let color = pickedCard.colors[0].split(' ').join('');
  // ? Create setName for color if first in set
  if (typeof properties[color] === 'undefined') {
    properties[color] = [];
  }
  // ? If first set already full, create another set with different name
  if (properties[color].length === pickedCard.rentAmounts.length) {
    color = `${color}1`;
    if (typeof properties.color === 'undefined') {
      properties[color] = [];
    }
  }
  // ? Add chosen property to PLAYER's property area
  properties[color].push(...hand.splice(target, 1));
  render();
  addTurn();
};

const discardCard = (cardID) => {
  addCardTo(game.discardPile, cardID);
  render();
};

const transferProperties = (set, index, from, to) => {
  const { properties: fromLocation } = game.playerHands[from];
  const { properties: toLocation } = game.playerHands[to];

  const pickedCard = fromLocation[set][index];

  let color = pickedCard.colors[0].split(' ').join('');

  if (typeof toLocation[color] === 'undefined') {
    toLocation[color] = [];
  }
  if (toLocation[color].length === pickedCard.rentAmounts.length) {
    color = `${color}1`;
    if (typeof toLocation.color === 'undefined') {
      toLocation[color] = [];
    }
  }

  toLocation[color].push(...fromLocation[set].splice(index, 1));
  render();
};

const transferMoney = (index, from, to) => {
  const { money: fromLocation } = game.playerHands[from];
  const { money: toLocation } = game.playerHands[to];

  if (typeof fromLocation[index].selected !== 'undefined') {
    fromLocation[index].selected = false;
  }

  toLocation.push(...fromLocation.splice(index, 1));
};

// ============ Pop up Render Functions ============ //

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

// const openRentAnyModal = (title, content) => {
//   const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
//   const $modal = $('<div>').addClass('modalCard');
//   const $header = $('<p>').text('').appendTo($modal);

//   const $row = $('<div>').addClass('row').appendTo($modal);

//   $('<button>').text('Use as Money').on('click', () => addMoney())
//     .appendTo($row);
//   $('<button>').text('Rent').on('click', () => rentAny())
//     .appendTo($row);

//   $modal.appendTo($modalBack);
// };

const openRentModal = (cardID, colors) => {
  // * check if current user is PLAYER, run automated function if computer
  if (game.currentTurn !== game.userTurn) {
    return computerRent(cardID, colors);
  }

  // * if is PLAYER, get information of their sets
  const { properties, hand } = game.playerHands[game.userTurn];
  const availbleSets = Object.keys(properties);
  const availblePropertyColors = [];
  for (const set in properties) {
    availblePropertyColors.push(properties[set][0].colors[0]);
  }
  // const pickedCard = hand.filter((card) => card.id === cardID)[0];

  // ?  ==== Render Rent Payment Modal ==== ? //
  createModalBase('Select a set to rent with');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  // * Rent choice area * //
  const $choiceContainer = $('<div>').addClass('modalChoiceContainer').appendTo($modal);
  colors.forEach((color, index, array) => {
    let propertyAvailble = false;
    let setTotal = 0;

    for (let i = 0; i < availblePropertyColors.length; i++) {
      if (availblePropertyColors[i] === color) {
        setTotal = calculatePropertyRentValue(game.currentTurn, availbleSets[i]);
        propertyAvailble = true;
      }
    }

    const $selectionOption = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer);
    const $choiceDisplay = $('<div>').addClass('wildPropDisplay').appendTo($selectionOption)
      .css('background-color', colorToHex('grey'))
      .css('color', 'darkGrey')
      .text(color);

    if (propertyAvailble) {
      $choiceDisplay
        .css('background-color', colorToHex(color))
        .css('color', color === colors.lightGreen || color === colors.lightBlue ? 'black' : 'white');
      $('<p>').addClass('propertyValueDisplay').text(`${setTotal}M`).appendTo($selectionOption);
      $selectionOption.on('click', () => handleSelectionClick(setTotal));
    }
    if (index === array.length - 1) { $selectionOption.addClass('last'); }
  });

  // * Rent choice area * //
  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>').text('Back').appendTo($buttonRow).on('click', () => closeModal());
  $('<button>').text('Use as Money').appendTo($buttonRow).on('click', () => handleAddMoney());

  // ?  ==== Modal Functions ==== ? //
  function handleSelectionClick(setTotal) {
    closeModal();
    rent(cardID, setTotal);
  }
  function handleAddMoney() {
    closeModal();
    addMoney(cardID);
  }
};

const openPayRentModal = (cardID, rentAmount, title) => {
  // console.log(cardID, rentAmount);
  const total = rentAmount;
  console.log(total);
  const { money, properties } = game.playerHands[game.userTurn];
  const selected = { money: { cards: {}, value: 0 }, property: { cards: {}, value: 0 } };
  let balance = total;
  console.log(balance);
  const falttenProperties = getFlattenProperties(game.userTurn);

  // console.log(selected);

  money.sort((a, b) => a.value - b.value);

  createModalBase(title || 'Pay Rent');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $RemainingBalance = $('<p>').text(`${balance}M`).addClass('rentBalance').appendTo($modal);

  // ? Container for money cards
  if (money.length > 0) {
    const $MoneyContainer = $('<div>').appendTo($modal).addClass('payRentSection');
    $('<p>').text('Money Cards').appendTo($MoneyContainer);
    const $MoneySelectionContainer = $('<div>').addClass('rentSelectionContainer').appendTo($MoneyContainer);
    // renderRentPaySeletionItems($MoneySelectionContainer, money);
    money.forEach((card, index, array) => {
      const $selectionOption = $('<div>').addClass('rentPayChoice')
        .on('click', (e) => {
          onMoneyClick(card, array, selected.money);
          $(e.currentTarget).toggleClass('optionSelected');
          balance = total - (selected.money.value + selected.property.value);
          $RemainingBalance.text(`${balance}M`);
        })
        .appendTo($MoneySelectionContainer);

      const $choiceDisplay = $('<div>').addClass('rentPayDisplay').appendTo($selectionOption)
        .css('background-image', `url(${card.image[0]})`)
        .css('background-size', 'contain');

      $('<p>').text(`${card.value}M`).appendTo($selectionOption);

      if (index === array.length - 1) {
        $selectionOption.addClass('last');
      }
    });
  }

  // * If not enough money show properties
  if (rentAmount > calculateTotalMoney(game.userTurn)) {
    const $PropertyContainer = $('<div>').appendTo($modal).addClass('payRentSection');
    $('<p>').text('Property Cards').appendTo($PropertyContainer);
    const $PropertySelectionContainer = $('<div>').addClass('rentSelectionContainer').appendTo($PropertyContainer);

    falttenProperties.forEach((card, index, array) => {
      const $selectionOption = $('<div>').addClass('rentPayChoice')
        .on('click', (e) => {
          propertiesOnClick(e, card, array);
          // onMoneyClick(card, array, selected.money);
        })
        .appendTo($PropertySelectionContainer);

      const $choiceDisplay = $('<div>').addClass('rentPayDisplay').appendTo($selectionOption)
        .css('background-image', `url(${card.image[0]})`)
        .css('background-size', 'contain');

      $('<p>').text(`${card.value}M`).appendTo($selectionOption);
    });
  }

  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  const $submitbutton = $('<button>').text('Use Selected Cards').on('click', () => onSubmitPress())
    .appendTo($buttonRow);

  /** @type {(card: object, deck:array ) => void} */
  function onMoneyClick(_card, deck, _output) {
    const card = _card;
    if (typeof card.selected === 'undefined') {
      card.selected = true;
    } else {
      card.selected = !card.selected;
    }

    const selectedCards = deck.filter((each) => each.selected);
    console.log(selectedCards);
    let totalValue = 0;
    if (selectedCards.length > 1) {
      totalValue = selectedCards.reduce((prev, current) => prev.value + current.value);
    } if (selectedCards.length === 1) {
      totalValue = selectedCards[0].value;
    }

    console.log('moneyValue', totalValue);
    Object.assign(selected.money,
      { cards: selectedCards, value: totalValue });
  }

  function propertiesOnClick(event, _card, deck) {
    const card = _card;
    if (typeof card.selected === 'undefined') {
      card.selected = true;
    } else {
      card.selected = !card.selected;
    }

    const selectedCards = deck.filter((each) => each.selected);
    let totalValue = 0;
    if (selectedCards.length > 1) {
      totalValue = selectedCards.reduce((prev, current) => prev.value + current.value);
    } if (selectedCards.length === 1) {
      totalValue = selectedCards[0].value;
    }

    console.log('propertyValue', totalValue);

    Object.assign(selected.property,
      { cards: selectedCards, value: totalValue });

    $(event.currentTarget).toggleClass('optionSelected');
    balance = total - (selected.money.value + selected.property.value);
    $RemainingBalance.text(`${balance}M`);
  }

  function onSubmitPress(event) {
    if (balance <= 0 || selected.property.cards.length === falttenProperties.length) {
      if (selected.money.cards.length > 0) {
        for (let i = 0; i < selected.money.cards.length; i++) {
          const card = selected.money.cards[i];
          transferMoney(
            money.map((e) => e.id).indexOf(card.id),
            game.userTurn, game.currentTurn,
          );
        }
      }
      if (selected.property.cards.length > 0) {
        for (let i = 0; i < selected.property.cards.length; i++) {
          const card = selected.property.cards[i];
          transferProperties(
            card.parent,
            properties[card.parent].map((e) => e.id).indexOf(card.id),
            game.userTurn, game.currentTurn,
          );
        }
      }
      closeModal();
      render();
      addTurn();
    }
  }
};

const openWinModal = (winnerIndex) => {
  const win = winnerIndex === game.userTurn;

  const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
  const $modal = $('<div>').addClass('modalCard').appendTo($modalBack);
  const $header = $('<h3>').text(win ? 'Congratulations!' : 'You Loss').appendTo($modal);
  // function closeModal() { $('.modalBase').remove(); }

  $('<p>').text(win
    ? 'Congrats you won!'
    : `Oh no, ${game.playerHands[winnerIndex].playerName} beat you!`)
    .appendTo($modal);

  const $ButtonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>')
    .text(win ? 'Play Again!' : 'Try Again')
    // eslint-disable-next-line no-restricted-globals
    .on('click', () => location.reload())
    .appendTo($ButtonRow);
};

const openDrawModal = () => {
  const $modalBack = $('<div>').addClass('modalBase').prependTo('body');
  const $modal = $('<div>').addClass('modalCard').appendTo($modalBack);
  const $header = $('<h3>').text('It\'s a draw').appendTo($modal);
  // function closeModal() { $('.modalBase').remove(); }

  $('<p>').text('You ran out of cards before any one could win')
    .appendTo($modal);

  const $ButtonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>')
    .text('Try Again')
    // eslint-disable-next-line no-restricted-globals
    .on('click', () => location.reload())
    .appendTo($ButtonRow);
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

  const $choiceContainer = $('<div>').addClass('modalChoiceContainer').appendTo($modal);

  pickedCard.colors.forEach((color, index, array) => {
    const $button = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer)
      .on('click', () => {
        setWildPropCurrentColor(color, pickedCard);
        addProperty(cardID);
        closeModal();
      });

    $('<div>').addClass('wildPropDisplay').appendTo($button)
      .css('background-image', `url(${pickedCard.image[index]})`)
      .css('background-size', 'contain');
    // .css('background-color', colorToHex(color));
    $('<p>').text(color).appendTo($button);
    if (index === array.length - 1) {
      $button.addClass('last');
    }
  });
  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>').text('Back').appendTo($buttonRow).on('click', () => closeModal());
};

const setWildPropCurrentColor = (color, card) => {
  const rentAmount = cardTypes.property[color.split(' ').join('')].rentAmounts;
  const target = card.colors.indexOf(color);
  card.colors.unshift(...card.colors.splice(target, 1));
  card.image.unshift(...card.image.splice(target, 1));
  // console.log(rentAmount);
  card.rentAmounts.push(...rentAmount);
  // console.log(card);
};

const openHouseModal = (cardID, player) => {
  const fullProperties = getProperties(game.currentTurn, 'fitForHouse');
  if (game.currentTurn !== game.userTurn) {
    return computerAddHouse(cardID);
  }

  if (fullProperties.length === 0) {
    return openRejectModal(cardID);
  }

  createModalBase('Add house to...');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $choiceContainer = $('<div>').addClass('modalChoiceContainer').appendTo($modal);
  fullProperties.forEach((color, index, array) => {
    const $container = $('<div>').addClass('wildPropChoice').appendTo($choiceContainer)
      .on('click', () => {
        addHouse(cardID, color);
        closeModal();
      });

    $('<div>').addClass('wildPropDisplay').appendTo($container)
      .css('background-color', colorToHex(color));
    $('<p>').text(color).appendTo($container);
    if (index === array.length - 1) {
      $container.addClass('last');
    }
  });

  const $buttonRow = $('<div>').addClass('row').appendTo($modal);
  $('<button>').text('Back').appendTo($buttonRow).on('click', () => closeModal());
  $('<button>').text('Use as Money').appendTo($buttonRow).on('click', () => {
    addMoney(cardID);
    closeModal();
  });
};

const openHotelModal = (cardID, player) => {
  const fullProperties = getProperties(game.currentTurn, 'fitForHotel');
  if (game.currentTurn !== game.userTurn) {
    return computerAddHotel(cardID);
  }

  if (fullProperties.length === 0) {
    return openRejectModal(cardID);
  }

  createModalBase('Add hotel to...');
  const $modal = $('.modalCard'); function closeModal() { $('.modalBase').remove(); }

  const $choiceContainer = $('<div>').addClass('modalChoiceContainer').appendTo($modal);
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
};

// ============ Calculate Fullsets ============ //

/** @type {(player: number, condition: 'full' | 'fitForHouse' | 'fitForHotel' | 'notFull') => string[]}
 * @description Take in player index and return an array of the name of completed sets
*/
const getProperties = (player, condition) => {
  const { properties } = game.playerHands[player];
  const filteredProperties = [];

  // ? Check through all PLAYER sets
  for (const setName in properties) {
    const set = properties[setName];

    // * based on condition return property that fits criteria
    switch (condition) {
      case 'full':
        if (set.length >= set[0]?.rentAmounts.length) {
          filteredProperties.push(setName);
        }
        break;
      case 'fitForHouse':
        if (set.length === set[0]?.rentAmounts.length) {
          filteredProperties.push(setName);
        }
        break;
      case 'fitForHotel':
        if (set.length === set[0]?.rentAmounts.length + 1) {
          filteredProperties.push(setName);
        }
        break;
      case 'notFull':
        if (set.length < set[0]?.rentAmounts.length) {
          filteredProperties.push(setName);
        }
        break;
      default: return filteredProperties;
    }
  }

  return filteredProperties;
};

// ============ Card Functions ============ //

// const rentAny = (color, player) => {};
function rent(cardID, rentAmount) {
  for (let i = 0; i < game.numberOfPlayers; i++) {
    if (i !== game.currentTurn && i !== game.userTurn) {
      computerPayRent(rentAmount, i);
    }
  }
  if (game.currentTurn !== game.userTurn) {
    openPayRentModal(cardID, rentAmount);
  }
  discardCard(cardID);
  if (game.currentTurn === game.userTurn) {
    addTurn();
  }
}
// const sayNo = (color, player) => {};
// const dealBreak = (color, player) => {};

const birthdayParty = (cardID, player) => {
  for (let i = 0; i < game.numberOfPlayers; i++) {
    if (i !== game.currentTurn && i !== game.userTurn) {
      computerPayRent(2, i);
    }
  }
  if (game.currentTurn !== game.userTurn) {
    openPayRentModal(cardID, 2, 'Sponsor Birthday!');
  }
  discardCard(cardID);
  if (game.currentTurn === game.userTurn) {
    addTurn();
  }
};

// const makeSlyDeal = (color, player) => {};
// const makeForcedDeal = (color, player) => {};
// const collectDebt = (color, player) => {};
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
const computerPayRent = (rentAmount, player) => {
  const info = {
    playerBalance: {
      money: calculateTotalMoney(player),
      property: calculateTotalPropertyValue(player),
    },
    cards: game.playerHands[player],
    toLocation: game.playerHands[game.currentTurn],
    rent: { amount: rentAmount, amountLeft: rentAmount },
    selected: { money: [], properties: [] },
  };

  const { money, properties } = info.cards;
  const sProperties = getFlattenProperties(player);
  // ? sort money lowest to highest
  money.sort((a, b) => a.value - b.value);

  // ? If PLAYER has enought money to fufill rent
  if (rentAmount <= info.playerBalance.money) {
    while (info.rent.amountLeft > 0 && money.length > 0) {
      // console.log('money value', money[0].value);
      info.rent.amountLeft -= money[0].value;
      info.selected.money.push(money.pop());
    }
    // Exit function
    return info.toLocation.money.push(...info.selected.money);
  }

  // ? If PLAYER does NOT have enough money in balance
  // * Draw all money from hand, if available
  if (money.length > 0) {
    while (money.length > 0) {
      info.selected.money.push(money.pop());
    }
    info.rent.amountLeft -= info.playerBalance.money;
  }
  // * If availble draw properties from PLAYER hand, till none are left of rent is paid
  if (sProperties.length > 0) {
    // eslint-disable-next-line no-mixed-operators
    while (sProperties.length > 0 || info.rent.amountLeft > 0 && sProperties.length > 0) {
      info.rent.amountLeft -= sProperties[0].value;
      info.selected.properties.push(sProperties.pop());
    }
  }

  // ? Process and send selected card to player requesting rent
  info.toLocation.money.push(...info.selected.money);
  for (const card of info.selected.properties) {
    transferProperties(
      card.parent,
      properties[card.parent].map((each) => each.id).indexOf(card.id),
      player,
      game.currentTurn,
    );
  }
};

function computerRent(cardID, colors) {
  const { properties } = game.playerHands[game.currentTurn];
  const availbleSets = Object.keys(properties);
  const availblePropertyColors = [];
  for (const set in properties) {
    if (properties[set].length > 0) {
      availblePropertyColors.push(properties[set][0].colors[0]);
    }
  }

  const applicableSets = [];

  // Log all available colors of user
  for (let i = 0; i < availblePropertyColors.length; i++) {
    for (const color of colors) {
      if (color === availblePropertyColors[i]) {
        applicableSets.push(availbleSets[i]);
      }
    }
  }

  if (applicableSets.length > 0) {
    const pickedColor = applicableSets[Math.floor(Math.random() * applicableSets.length)];
    const rentAmount = calculatePropertyRentValue(game.currentTurn, pickedColor);
    rent(cardID, rentAmount);
    discardCard(cardID);
  } else {
    addMoney(cardID);
  }
}

function computerAddHouse(cardID) {
  // Get sets that contain full set of cards
  const fullProperties = getProperties(game.currentTurn, 'fitForHouse');
  // If condition not fufiled use as cash
  if (fullProperties.length === 0) {
    return addMoney(cardID);
  }
  // else pick a full set and add the house to it
  const pickedProperty = Math.floor(Math.random() * fullProperties.length);
  return addHouse(cardID, pickedProperty);
  // return addHouse(cardID, fullProperties[0]);
}

function computerAddHotel(cardID) {
  const fullProperties = getProperties(game.currentTurn, 'fitForHotel');
  if (fullProperties.length === 0) {
    return addMoney(cardID);
  }

  const pickedProperty = Math.floor(Math.random() * fullProperties.length);

  return addHotel(cardID, pickedProperty);
}

function computerAddWildCard(colors, pickedCard, cardID) {
  const index = Math.floor(Math.random() * colors.length);
  const pickedColor = colors[index];

  setWildPropCurrentColor(pickedColor, pickedCard);
  addProperty(cardID);
}

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

function colorToHex(color) {
  switch (color) {
    case colors.red: return '#EF5350';
    case colors.yellow: return '#FFD54F';
    case colors.blue: return '#2962FF';
    case colors.green: return '#388E3C';
    case colors.brown: return '#6D4C41';
    case colors.lightBlue: return '#E1F5FE';
    case 'LightBlue': return '#E1F5FE';
    case colors.lightGreen: return '#E0F2F1';
    case 'LightGreen': return '#E0F2F1';
    case colors.black: return '#000000';
    case colors.purple: return '#9C27B0';
    case colors.orange: return '#FFA726';
    case 'grey': return '#b0bec5';
    default: return '#000000';
  }
}

/** @type {(cardNames: string[]) => string[]} */
const getCardImage = (cardName) => {
  switch (cardName) {
    // Properties
    case 'Black Property': return ['./assets/property_black.png'];
    case 'Blue Property': return ['./assets/property_blue.png'];
    case 'Brown Property': return ['./assets/property_brown.png'];
    case 'Green Property': return ['./assets/property_green.png'];
    case 'Light Blue Property': return ['./assets/property_lightBlue.png'];
    case 'Light Green Property': return ['./assets/property_lightGreen.png'];
    case 'Orange Property': return ['./assets/property_orange.png'];
    case 'Purple Property': return ['./assets/property_purple.png'];
    case 'Red Property': return ['./assets/property_red.png'];
    case 'Yellow Property': return ['./assets/property_yellow.png'];
    // Wild Property Cards
    // case 'Any Property': return [''];
    case 'Brown-Light Blue Property': return ['./assets/wildCard_brownLightBlue.png', './assets/wildCard_lightBlueBrown.png'];
    case 'Black-Light Blue Property': return ['./assets/wildCard_blackLightBlue.png', './assets/wildCard_lightBlueBlack.png'];
    case 'Orange-Purple Property': return ['./assets/wildCard_orangePurple.png', './assets/wildCard_purpleOrange.png'];
    case 'Red-Yellow Property': return ['./assets/wildCard_redYellow.png', './assets/wildCard_yellowRed.png'];
    case 'Blue-Green Property': return ['./assets/wildCard_blueGreen.png', './assets/wildCard_greenBlue.png'];
    case 'Green-Black Property': return ['./assets/wildCard_greenBlack.png', './assets/wildCard_blackGreen.png'];
    case 'Black-Light Green Property': return ['./assets/wildCard_blackLightGreen.png', './assets/wildCard_lightGreenBlack.png'];
    // Money
    case '1M': return ['./assets/money_1m.png'];
    case '2M': return ['./assets/money_2m.png'];
    case '3M': return ['./assets/money_3m.png'];
    case '4M': return ['./assets/money_4m.png'];
    case '5M': return ['./assets/money_5m.png'];
    case '10M': return ['./assets/money_10m.png'];
    // Action Cards
    case 'Just say no': return ['./assets/action_sayNo.png'];
    case 'Deal breaker': return ['./assets/action_dealBreaker.png'];
    case 'It\'s Your Birthday': return ['./assets/action_birthday.png'];
    case 'Sly deal': return ['./assets/action_slyDeal.png'];
    case 'Forced deal': return ['./assets/action_forcedDeal.png'];
    case 'Debt collector': return ['./assets/action_debtCollect.png'];
    case 'Double the Rent': return ['./assets/action_doubleRent.png'];
    case 'Hotel': return ['./assets/action_hotel.png'];
    case 'House': return ['./assets/action_house.png'];
    case 'Pass Go': return ['./assets/action_passGo.png'];
    // Rent Cards
    // case 'Any Rent': return ['];
    case 'Blue-Green Rent': return ['./assets/rent_blueGreen.png'];
    case 'Orange-Purple Rent': return ['./assets/rent_purpleOrange.png'];
    case 'Black-Light Green Rent': return ['./assets/rent_blackLightGreen.png'];
    case 'Brown-Light Blue Rent': return ['./assets/rent_brownLightBlue.png'];
    case 'Red-Yellow Rent': return ['./assets/rent_redYellow.png'];
    default: return ['./assets/cardBack.png'];
  }
};

class Card {
  constructor(name, value, action, totalCards) {
    this.name = name;
    this.value = value;
    this.totalCards = totalCards;
    this.action = action;
    this.rentAmounts = [];
    this.image = getCardImage(this.name);
  }
}

class MoneyCard extends Card {
  constructor(name, value, totalCards) {
    super();
    this.name = name;
    this.value = value;
    this.totalCards = totalCards;
    this.action = (cardID) => addMoney(cardID);
    this.image = getCardImage(this.name);
  }
}

class RentCard extends Card {
  constructor(name, value, totalCards, color) {
    super();
    this.name = `${name} Rent`;
    this.value = value;
    this.totalCards = totalCards;
    this.colors = color;
    this.image = getCardImage(this.name);
    this.action = (cardID) => {
      if (this.name === 'Any') {
        // openRentAnyModal(cardID, this.colors);
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
    this.image = getCardImage(this.name);
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
  money: {
    '1M': new MoneyCard('1M', 1, 6),
    '2M': new MoneyCard('2M', 2, 2),
    '3M': new MoneyCard('3M', 3, 3),
    '4M': new MoneyCard('4M', 4, 3),
    '5M': new MoneyCard('5M', 5, 2),
    '10M': new MoneyCard('10M', 10, 1),
  },
  actionCard: {
  //   justSayNo: new Card('Just say no', 4, (cardID) => sayNo(cardID), 3),
  //   dealBreaker: new Card('Deal breaker', 5, (cardID) => dealBreak(cardID), 2),
    itsYourBirthday: new Card('It\'s Your Birthday', 2, (cardID) => birthdayParty(cardID), 3),
    //   slyDeal: new Card('Sly deal', 3, (cardID) => makeSlyDeal(cardID), 3),
    //   forcedDeal: new Card('Forced deal', 3, (cardID) => makeForcedDeal(cardID), 3),
    //   debtCollector: new Card('Debt collector', 3, (cardID) => collectDebt(cardID), 3),
    //   doubleTheRent: new Card('Double the Rent', 1, (cardID) => doubleRent(cardID), 2),
    hotel: new Card('Hotel', 4, (cardID) => openHotelModal(cardID), 3),
    house: new Card('House', 2, (cardID) => openHouseModal(cardID), 2),
    passGo: new Card('Pass Go', 1, (cardID) => passGo(cardID), 10),
  },
  rent: {
  //   any: new RentCard('Any', 3, 3, colors.allColors()),
    blueGreen: new RentCard('Blue-Green', 1, 2, [colors.blue, colors.green]),
    orangePurple: new RentCard('Orange-Purple', 1, 2, [colors.orange, colors.purple]),
    blackLightGreen: new RentCard('Black-Light Green', 1, 20, [colors.black, colors.lightGreen]),
    brownLightBlue: new RentCard('Brown-Light Blue', 1, 2, [colors.brown, colors.lightBlue]),
    redYellow: new RentCard('Red-Yellow', 1, 2, [colors.red, colors.yellow]),
  },
  property: {
    Orange: new PropertyCard('Orange', 2, 3, [colors.orange], [1, 3, 5], ['Bow Street', 'Marlborough Street', 'Vine Street']),
    Blue: new PropertyCard('Blue', 4, 2, [colors.blue], [3, 8], ['Park Lane', 'Mayfair']),
    Green: new PropertyCard('Green', 4, 3, [colors.green], [2, 4, 7], ['Regent Street', 'Oxford Street', 'Bond Street']),
    Red: new PropertyCard('Red', 3, 3, [colors.red], [2, 3, 6], ['Strand', 'Fleet Street', 'Trafalgar Square']),
    Yellow: new PropertyCard('Yellow', 2, 3, [colors.yellow], [2, 4, 6], ['Coverntry Street', 'Leicester Square', 'Piccadilly']),
    Purple: new PropertyCard('Purple', 2, 3, [colors.purple], [1, 2, 4], ['Pall Mall', 'Whitehall', "Northumrl'd Avenue"]),
    Black: new PropertyCard('Black', 2, 4, [colors.black], [1, 2, 3, 4], ['Marylebone Station', 'Fenchurch St. Station', 'Liverpool St. Station', "King's Cross Station"]),
    Brown: new PropertyCard('Brown', 1, 2, [colors.brown], [1, 2], ['Old Kent Road', 'Whitechapel Road']),
    LightGreen: new PropertyCard('Light Green', 2, 20, [colors.lightGreen], [1, 2], ['Electric Company', 'Water Works']),
    LightBlue: new PropertyCard('Light Blue', 1, 3, [colors.lightBlue], [1, 2, 3], ['Euston Road', 'The Angel Islington', 'Pentonville Road']),
    // any: new PropertyCard('Any', 0, 2, [...colors.allColors()]),
    brownLightBlue: new PropertyCard('Brown-Light Blue', 1, 1, [colors.brown, colors.lightBlue]),
    blackLightBlue: new PropertyCard('Black-Light Blue', 4, 1, [colors.black, colors.lightBlue]),
    orangePurple: new PropertyCard('Orange-Purple', 2, 2, [colors.orange, colors.purple]),
    redYellow: new PropertyCard('Red-Yellow', 3, 2, [colors.red, colors.yellow]),
    blueGreen: new PropertyCard('Blue-Green', 4, 1, [colors.blue, colors.green]),
    greenBlack: new PropertyCard('Green-Black', 4, 1, [colors.green, colors.black]),
    blackLightGreen: new PropertyCard('Black-Light Green', 2, 1, [colors.black, colors.lightGreen]),
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

/** @type {(deck: object[]) => Array} */
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
  replenishDrawPile();

  for (let i = 0; i < amount; i++) {
    replenishDrawPile();
    hand.push(source.pop());
  }
  render();
};

const replenishDrawPile = () => {
  if (game.drawPile.length === 0) {
    if (game.discardPile.length === 0) {
      return openDrawModal();
    }
    game.drawPile.push(...shuffleDeck(game.discardPile));
  }
};

const logAction = (text) => {
  $('<p>').html(text)
    .addClass('gameLogText')
    .appendTo('#logTextContainer');
};

/** @type {() => void} */
const endTurn = () => {
  if (game.currentTurn === game.numberOfPlayers - 1) {
    game.currentTurn = 0;
  } else {
    game.currentTurn += 1;
  }

  // ? Draw cards at start of next turn
  if (game.playerHands[game.currentTurn].hand.length === 0) {
    drawCards(game.drawPile, game.playerHands[game.currentTurn].hand, 5);
  } else {
    drawCards(game.drawPile, game.playerHands[game.currentTurn].hand, 2);
  }

  // ? Then initiate computer turn if not user's turn
  if (game.currentTurn !== game.userTurn) {
    computerTurn(game.currentTurn);
  }
};

function computerTurn(player) {
  const { hand, playerName } = game.playerHands[player];
  const randomCard = Math.floor(Math.random() * hand.length);
  const pickedCard = hand[randomCard];

  if (game.currentTurn !== game.userTurn) {
    if (hand.length === 0) {
      return endTurn();
    }
    logAction(`<b>${playerName}</b> played <b>${pickedCard.name}</b>`);
    // console.log(`Player ${player} played, ${pickedCard.name}`);
    pickedCard.action(pickedCard.id);
  }
}

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
  const player = game.playerHands[game.currentTurn];

  checkWin();
  // Update player turn once actions cards are up
  if (player.turn === 3) {
    player.turn = 1;
    if (game.currentTurn !== game.userTurn) {
      logAction(`- - - - ${player.playerName} turn ends - - - -`);
    }
    endTurn();
  } else {
    player.turn += 1;
    if (game.currentTurn !== game.userTurn) {
      setTimeout(() => {
        computerTurn(game.currentTurn);
      },
      150);
    }
  }
}

const checkWin = () => {
  for (let playerIndex = 0; playerIndex < game.numberOfPlayers; playerIndex++) {
    const fullSets = getProperties(playerIndex, 'full');

    if (fullSets.length >= game.setsToWin) {
      return openWinModal(playerIndex);
    }
  }
};

function calculateTotalMoney(player) {
  const { money } = game.playerHands[player];
  let total = 0;
  for (const card of money) {
    total += card.value;
  }

  return total;
}

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

const getFlattenProperties = (player) => {
  const { properties } = game.playerHands[player];
  const flattenProperties = [];

  for (const sets in properties) {
    properties[sets].forEach((card) => {
      flattenProperties.push({ ...card, parent: sets });
    });
  }
  return flattenProperties;
};

function calculatePropertyRentValue(player, setName) {
  const { properties } = game.playerHands[player];
  const selectedSet = properties[setName];
  const lastCard = selectedSet.length - 1;

  return selectedSet[lastCard].rentAmounts[lastCard];
}

function removeEmptySpace(string) {
  return string.split(' ').join('');
}

// ============ Render Functions ============ //
const renderCard = (parent, cardInfo, stackPosition, size) => {
  const $cardContainer = $('<div>')
    .addClass('card')
    .attr('id', cardInfo.id)
    .appendTo(parent)
    .on('click', () => cardInfo.action(cardInfo.id))
    // .text(`${cardInfo.name} \n ${cardInfo.type}`)
    .css('background-image', `url(${cardInfo.image[0]})`)
    .css('background-size', 'contain')
    .hover((e) => {
      e.stopPropagation();
      $(e.currentTarget).toggleClass('cardToFront focusCard');
    });
  if (stackPosition > 0) {
    $cardContainer.css('top', stackPosition * 30)
      .css('position', 'absolute');
  }
  if (size) {
    $cardContainer.css('height', `${size}px`);
    $cardContainer.css('width', `${size / 1.6}px`);
  }
};

const renderOtherCard = (parent, cardInfo, hideInfo, stackPosition, size) => {
  // console.log(parent, cardInfo);
  const $cardContainer = $('<div>')
    .addClass('otherPCard card')
    .attr('id', cardInfo.id);
  if (!hideInfo) {
    $cardContainer
      .css('background-image', `url(${cardInfo.image[0]})`)
      .css('background-size', 'contain')
      .hover((e) => {
        e.stopPropagation();
        $(e.currentTarget).toggleClass('cardToFront focusOtherCard');
      });
  }
  if (hideInfo) {
    $cardContainer
      .addClass('card-back')
      .text('');
  }
  if (stackPosition > 0) {
    $cardContainer
      .css('top', stackPosition * 15)
      .css('position', 'absolute');
  }
  if (size) {
    $cardContainer
      .css('height', `${size}px`)
      .css('width', `${size / 1.6}px`);
  }
  if (DEBUG) {
    $cardContainer
      .text(` ${cardInfo.name} \n ${cardInfo.type} `)
      .on('click', () => cardInfo.action(cardInfo.id));
  }

  $cardContainer.appendTo($(parent));
};

const renderPileCard = (parent, deck, position) => {
  const $cardContainer = $('<div>')
    .addClass('card').addClass('card-back').addClass('piled-card')
    .appendTo(parent)
    .css('left', position * 0.25);
    // .text(deck.length)
    // .on('click', () => drawCards(deck, game.playerHands[game.currentTurn].hand, 1));
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
  money.sort((a, b) => a.value - b.value);
  $('#userMoney').children().remove();
  // ========== Stackless money card render ========== //
  // if (money.length > 0) {
  //   for (const card of money) {
  //     renderCard('#userMoney', card);
  //   }
  // }
  const moneyStacks = {};
  // console.log(money);
  money.forEach((card) => {
    if (typeof moneyStacks[`${card.value}M`] === 'undefined') {
      moneyStacks[`${card.value}M`] = [];
    }
    moneyStacks[`${card.value}M`].push(card);
  });

  for (const key in moneyStacks) {
    $('<div>').attr('id', key).appendTo('#userMoney');
    for (let i = 0; i < moneyStacks[key].length; i++) {
      renderCard(`#${key}`, moneyStacks[key][i], i, 100);
    }
  }
};

const renderMoneyTotal = () => {
  $('#userMoneyTotal').text(`${calculateTotalMoney(game.userTurn)}`);
};

const renderFullSets = () => {
  $('#userFullSets').text(`${getProperties(game.userTurn, 'full').length}`);
};

const renderProperty = () => {
  const { properties } = game.playerHands[game.userTurn];
  $('#userProperty').children().remove();

  for (const color in properties) {
    $('<div>').addClass('propertyCardPile').attr('id', color).appendTo('#userProperty');
    for (let i = 0; i < properties[color].length; i++) {
      renderCard(`#${color}`, properties[color][i], i);
    }
  }
};

// ============ Render Computer field ============ //
const renderOtherPlayerField = (player) => {
  const { playerId: id, playerName } = game.playerHands[player];
  const $parent = $('.otherPlayerFields');

  const $playerField = $('<div>').attr('id', `${id}-field`).addClass('otherField')
    .html(`
    <div class="otherPlayerName">
    <h4>${playerName}</h4>
    <i class="fas fa-user-circle"></i>
    </div>
    <div class="otherHand">
      <div id="${id}Hand" class="otherCardPile"></div>
      <div class="row"> </div>
    </div>

    <div class="row">
      <div class="otherMoneyPile">
        <div class="row otherIndicator">
          <p small>Total: <span id="${id}MoneyTotal">0</span>M</p>
        </div>
        <div id="${id}Money" class="otherCardPile"></div>
      </div>
      <div class="otherPropertyPile">
        <div class="row otherIndicator">
          <p small><span id="${id}FullSets">0</span> Full Sets<p>
        </div>
        <div id="${id}Property" class="otherCardPile"></div>
      </div>
    </div>
  `);

  $playerField.appendTo($parent);
};

const renderOtherPlayerHand = (player) => {
  const { playerId: id, hand, money, properties } = game.playerHands[player];
  $(`#${id}Hand`).children().remove();

  for (const card of hand) {
    renderOtherCard(`#${id}Hand`, card, true, 0, 50);
  }
};
const renderOtherPlayerMoney = (player) => {
  const { playerId: id, money } = game.playerHands[player];
  money.sort((a, b) => a.value - b.value);
  $(`#${id}Money`).children().remove();

  const moneyStacks = {};

  money.forEach((card) => {
    if (typeof moneyStacks[`${card.value}M`] === 'undefined') {
      moneyStacks[`${card.value}M`] = [];
    }
    moneyStacks[`${card.value}M`].push(card);
  });

  for (const key in moneyStacks) {
    $('<div>').attr('id', `${key}${id}`).appendTo(`#${id}Money`);
    for (let i = 0; i < moneyStacks[key].length; i++) {
      renderOtherCard(`#${key}${id}`, moneyStacks[key][i], false, i);
    }
  }
};

const renderOtherPlayerMoneyTotal = (player) => {
  const { playerId: id } = game.playerHands[player];

  $(`#${id}MoneyTotal`).text(`${calculateTotalMoney(player)}`);
};
const renderOtherPlayerFullSets = (player) => {
  const { playerId: id } = game.playerHands[player];

  $(`#${id}FullSets`).text(`${getProperties(player, 'full').length}`);
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

const renderCardPile = () => {
  $('#drawPile').children().remove();
  $('#discardPile').children().remove();
  for (let i = 0; i < game.drawPile.length; i++) {
    const element = game.drawPile[i];
    renderPileCard('#drawPile', game.drawPile, i);
  }
  $('#drawPileIndicator').text(`${game.drawPile.length} cards left`);
  for (const card of game.discardPile) {
    renderPileCard('#discardPile', game.discardPile);
  }
  $('#discardPileIndicator').text(`${game.discardPile.length} cards`);
};

function render() {
  renderCardPile();
  renderPlayerHand();
  renderMoney();
  renderProperty();
  renderMoneyTotal();
  renderFullSets();

  for (let i = 0; i < game.numberOfPlayers; i++) {
    if (i !== game.userTurn) {
      renderOtherPlayerHand(i);
      renderOtherPlayerProperty(i);
      renderOtherPlayerMoney(i);
      renderOtherPlayerMoneyTotal(i);
      renderOtherPlayerFullSets(i);
    }
  }
  // console.log(game);
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
  drawCards(game.drawPile, game.playerHands[game.currentTurn].hand, 2);

  // * Page button listerners
  $('#endTurn').on('click', () => endTurn());
};

$(main);
