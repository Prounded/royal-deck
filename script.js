//TODO:
//! TAMBAHIN DIFFICULTY
// per level, persentase kartu makin kecil.
// Kalo kalah, ada kartu baru yang gambarnya sama (buat nunjukinn kalo kalah)
// makin lama gamenya, makin sering buat dapet bencana
//
const DEFAULT_MONEY = 6;                        //? 4                       Starting Money
const BOOST_DEFAULT_PRICE = 8;                  //? 10$                     Starting boost price
const BOOST_INCREMENT_PRICE = 3;                //? 3$                      Every boost price increment
const BOOST_INCREMENT_PRICE_PER_LEVEL = 1.25    //? 1.25                    Price boost increase by this mult every level 
const MONEY_CARD_VALUE = 7;                     //? 5$                      Default money card value
const DEFAULT_CROWN_PRICE = [100, 150, 250];    //? [100, 150, 250]$        Default crown price
const CROWN_UPGRADE_VALUE = 5;                  //? 5                       Crown boost value in array
const SHIELD_UPGRADE_VALUE = 5;                 //? 5                       Shield boost value in array
const CROWN_PRICE_DOWN_UPGRADE_VALUE = 10;      //?10%                      Crown price down by value
const DOWN_CRISIS_UPGRADE_VALUE = 2;            //? 2                       Crisis chance array get lower by value
const PENALTY_INCREMENT = 2;                    //? 2                       If the crisis reach level 5, other get added by this mult
const BOOST_MONEY = 3;                          //? 3$                      Money boost value card

let MONEY_CARD_INCREMENT = 0;
let totalPercentDown = 0;
let gameStillGoing = true;

let chanceDrawCard = {
    'fire': 30,
    'conflict': 30,
    'economy': 30,
    'corruption': 30,
    'war': 30,
    'money': 75,
    'warDefence': 35,
    'crown': 1, 
    'attackCrown': 15};
const typeCardList = ['fire', 'conflict', 'economy', 'corruption', 'war'];

const level1_Card = [
	'fireCard_lvl1.png',
	'conflictCard_lvl1.png',
	'economyCard_lvl1.png',
	'leaderLossCard_lvl1.png',
	'warCard_lvl1.png',
];
const level3_Card = [
	'fireCard_lvl3.png',
	'conflictCard_lvl3.png',
	'economyCard_lvl3.png',
	'leaderLossCard_lvl3.png',
	'warCard_lvl3.png',
];
const level5_Card = [
	'fireCard_lvl5.png',
	'conflictCard_lvl5.png',
	'economyCard_lvl5.png',
	'leaderLossCard_lvl5.png',
	'warCard_lvl5.png',
];

function startGame() {
    const eventContainer = document.querySelectorAll('.cards');
    const alleventContainer = document.querySelectorAll('.eventContainer');
    const allUserCard = document.querySelectorAll('.userCard');
    document.querySelector('.cardSlotNumber').textContent = `${allUserCard.length}/2`;

    localStorage.setItem('currentMoney', DEFAULT_MONEY);
	let currentMoney = Number(localStorage.getItem('currentMoney'));
    document.getElementById('userMoney').textContent = `${currentMoney.toLocaleString()}$`;
    
    for (let index = 0; index < eventContainer.length; index++) {
        const currentCard = eventContainer[index];
        const randomDuration = Math.floor(Math.random() * 5000) + 3000;
        const randomOrientation = Math.round(Math.random()) === 0;
        
        currentCard.style.animationDuration = `${randomDuration}ms`;
        if (randomOrientation) {
            currentCard.style.animationDirection = 'reverse';
        }
    }

    for (let index = 0; index < alleventContainer.length; index++){
        alleventContainer[index].addEventListener('click', decreaseCrisis);
    }

    const buttonBuy = document.querySelectorAll('.boostUpgradeButton');
    for (let index = 0; index < buttonBuy.length; index++){
        buttonBuy[index].addEventListener('click', buyBoost);
        buttonBuy[index].setAttribute('data-price', BOOST_DEFAULT_PRICE);
        buttonBuy[index].textContent = `${BOOST_DEFAULT_PRICE}$`;
        console.log('ok')
    }

	const allBoostLevel = document.querySelectorAll('.boostLevel');
	const allCurrentBoostLevel = document.querySelectorAll('.currentBoostLevel');

    for (let index = 0; index < allBoostLevel.length; index++){
        const maxLevel = allBoostLevel[index].getAttribute('data-levelMax');
		let currentLevel = Number(
			allBoostLevel[index].textContent
				.slice(0, allBoostLevel[index].textContent.indexOf('/') - 1)
				.replace('Level', '')
		);
		allBoostLevel[index].textContent = `Level ${currentLevel} / ${maxLevel}`;
		allCurrentBoostLevel[index].style.width = `${((currentLevel) / maxLevel) * 100}%`;
    }

    document.querySelector('.drawDeckDiv').addEventListener('click', drawCard);
    document.querySelector('.buyCrownButton').addEventListener('click', buyCrown);

    const allChance = makeChances();
    document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / allChance.length) * 100) / 100}%`;

    document.querySelector('.buyCrownButton').setAttribute('data-price', DEFAULT_CROWN_PRICE[0]);
    document.querySelector('.buyCrownButton').textContent = `${DEFAULT_CROWN_PRICE[0]}$`;
}

function decreaseCrisis() {
	const allUserCard = document.querySelectorAll('.userCard');
    const eventContainer = document.querySelectorAll('.eventContainer');
    
    const currentEventDecreased = event.target.parentElement;
	const currentEventTitle = currentEventDecreased.getAttribute('data-event');
	const currentEventLevel = Number(currentEventDecreased.getAttribute('data-level'));
	const currentEventImage = currentEventDecreased.querySelector('.currentEventImage');
    const currentNextEventImage = currentEventDecreased.querySelector('.nextEventImage');
    let doneDecreasing = false;
    let decreasePossible = false;


    if (currentEventLevel === 1) {
        for (let index = 0; index < eventContainer.length; index++) {
            if (index !== typeCardList.indexOf(currentEventTitle)) {
                if (Number(eventContainer[index].getAttribute('data-level')) !== 0 &&
                    Number(eventContainer[index].getAttribute('data-level')) !== 5) {
                    decreasePossible = true;
                }
            }
        }   
    }
    else {
        decreasePossible = true;
    }

	for (let index = 0; index < eventContainer.length; index++) {
		eventContainer[index].removeEventListener('click', decreaseCrisis);
    }
    document.querySelector('.drawDeckDiv').removeEventListener('click', drawCard);

	for (let index = allUserCard.length - 1; index >= 0; index--) {
		if (allUserCard[index].getAttribute('data-action') === 'decreaseCrisis' && currentEventLevel !== 0 && decreasePossible) {
			doneDecreasing = true;
			document.querySelector('.cardSlotNumber').textContent = `${allUserCard.length - 1}/2`;
			allUserCard[index].style.animationDirection = 'normal';
			allUserCard[index].classList.add('removingCardAnimation');
			allUserCard[index].style.animationDuration = `${1000}ms`;

			let nextImage = 'crisisSolvedCard.png';
			if (currentEventLevel === 5) {
				nextImage = level3_Card[typeCardList.indexOf(currentEventTitle)];
				currentEventDecreased.setAttribute('data-level', 3);
			} else if (currentEventLevel === 3) {
				nextImage = level1_Card[typeCardList.indexOf(currentEventTitle)];
				currentEventDecreased.setAttribute('data-level', 1);
			} else if (currentEventLevel === 1) {
				currentEventDecreased.setAttribute('data-level', 0);
			}
			currentNextEventImage.src = nextImage;
			currentEventDecreased.style.animationDuration = `${2000}ms`;
			currentEventDecreased.style.animationDirection = 'normal';
			currentEventDecreased.classList.add('crownFlip');

			setTimeout(() => {
				allUserCard[index].style.visibility = 'hidden';
				for (let i = 0; i < allUserCard.length; i++) {
					allUserCard[i].style.animationDuration = `${1550}ms`;
					if (allUserCard.length > 1 && i !== index) {
						allUserCard[i].classList.add('moveRightAnimation');
						allUserCard[i].style.animationDirection = 'normal';
					}
				}

                setTimeout(() => {
                    const chanceList = makeChances();

                    document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / chanceList.length) * 100) / 100}%`;
					document.querySelector('.usableCardDiv').removeChild(allUserCard[index]);

					for (let i = 0; i < allUserCard.length - 1; i++) {
						allUserCard[i].classList.remove('moveRightAnimation');
						createAnimation(allUserCard[i]);
                    }
                    for (let index = 0; index < eventContainer.length; index++) {
						eventContainer[index].addEventListener('click', decreaseCrisis);
					}
                    document.querySelector('.drawDeckDiv').addEventListener('click', drawCard);
				}, 1500);
			}, 950);

            setTimeout(() => {
				currentEventImage.src = nextImage;
				currentNextEventImage.src = level5_Card[typeCardList.indexOf(currentEventTitle)];
				if (currentEventLevel === 1) {
					currentNextEventImage.src = level1_Card[typeCardList.indexOf(currentEventTitle)];
				} else if (currentEventLevel === 3) {
					currentNextEventImage.src = level3_Card[typeCardList.indexOf(currentEventTitle)];
				} else if (currentEventLevel === 5) {
					currentNextEventImage.src = level5_Card[typeCardList.indexOf(currentEventTitle)];
				}
				currentEventDecreased.classList.remove('crownFlip');
				createAnimation(currentEventDecreased);
			}, 1950);

			break;
		}
	}

	if (!doneDecreasing && currentEventLevel !== 0 && decreasePossible) {
		for (let index = 0; index < eventContainer.length; index++) {
			eventContainer[index].addEventListener('click', decreaseCrisis);
        }
        document.querySelector('.drawDeckDiv').addEventListener('click', drawCard);
		errorDisplay('noCorrectCard');
	} else if (!doneDecreasing && currentEventLevel === 0) {
		for (let index = 0; index < eventContainer.length; index++) {
			eventContainer[index].addEventListener('click', decreaseCrisis);
        }
        document.querySelector('.drawDeckDiv').addEventListener('click', drawCard);
		errorDisplay('crisisSolved');
    }
    else if (!doneDecreasing && !decreasePossible) {
        for (let index = 0; index < eventContainer.length; index++) {
			eventContainer[index].addEventListener('click', decreaseCrisis);
		}
        document.querySelector('.drawDeckDiv').addEventListener('click', drawCard);
        errorDisplay('notPossibleDecrement');
    }
}

function makeChances() {
	const allEventList = [
		'fire',
		'conflict',
		'economy',
		'corruption',
		'war',
		'money',
		'warDefence',
		'crown',
		'attackCrown',
	];
    let cardEvent = ['fire', 'conflict', 'economy', 'corruption', 'war', 'money', 'warDefence', 'crown', 'attackCrown'];
    let deletedCrisis = [];
    let availableCrisis = [];
    let needAddCrisis = 0;

	let eventListChance = [];
	if (document.querySelectorAll('.userCard').length >= 2) {
		cardEvent.splice(cardEvent.indexOf('warDefence'), 1);
	}

	const allEventContainer = document.querySelectorAll('.eventContainer');
	for (let index = 0; index < allEventContainer.length; index++) {
        if (
			Number(allEventContainer[index].getAttribute('data-level')) === 5 ||
			Number(allEventContainer[index].getAttribute('data-level')) === 0
        ) {
            if (Number(allEventContainer[index].getAttribute('data-level')) === 5) {
                deletedCrisis.push(allEventContainer[index].getAttribute('data-event'));   
            }
			cardEvent.splice(cardEvent.indexOf(allEventContainer[index].getAttribute('data-event')), 1);
        }
        else {
            availableCrisis.push(typeCardList[index]);
        }
    }

    for (let index = 0; index < deletedCrisis.length; index++){
        needAddCrisis += Math.ceil((chanceDrawCard[deletedCrisis[index]] * (PENALTY_INCREMENT - 1)));
    }

    if (availableCrisis.length > 0) {
        for (let index = 0; index < Math.ceil(needAddCrisis / availableCrisis.length); index++) {
			for (let i = 0; i < availableCrisis.length; i++) {
				eventListChance.push(availableCrisis[i]);
			}
		}   
    }

	const allCrownDiv = document.querySelectorAll('.crownDiv');
	let selectedCrown = 0;
	for (let index = 0; index < allCrownDiv.length; index++) {
		if (allCrownDiv[index].getAttribute('data-value') === 'crown') {
			selectedCrown++;
		}
	}
	if (selectedCrown === 0) {
		cardEvent.splice(cardEvent.indexOf('attackCrown'), 1);
	}

	for (let index = 0; index < allEventList.length; index++) {
		if (cardEvent.includes(allEventList[index])) {
			for (let i = 0; i < chanceDrawCard[allEventList[index]]; i++) {
				eventListChance.push(allEventList[index]);
			}
		}
    }
	return eventListChance;
}

function buyCrown() {
    const currentPrice = Number(event.target.getAttribute('data-price'));
    const userMoney = Number(localStorage.getItem('currentMoney'));
    if (userMoney >= currentPrice) {
        const allCrownDiv = document.querySelectorAll('.crownDiv');

        localStorage.setItem('currentMoney', userMoney - currentPrice);
        document.getElementById('userMoney').textContent = `${(userMoney - currentPrice).toLocaleString()}$`;

        for (let index = 0; index < allCrownDiv.length; index++){
            currentCrownDiv = allCrownDiv[index];
            if (currentCrownDiv.getAttribute('data-value') === 'blank') {
                const nextPrice = Math.round(DEFAULT_CROWN_PRICE[index + 1] - (DEFAULT_CROWN_PRICE[index + 1] * (totalPercentDown / 100)));
				event.target.setAttribute('data-price', nextPrice);
				event.target.textContent = `${event.target.getAttribute('data-price')}$`;
                resolveCard('crown');
                if (index === 2) {
                    event.target.textContent = '-';
                    event.target.classList.add('notHover');
                    document.querySelector('.buyCrownButton').removeEventListener('click', buyCrown);
                    gameWin();
                }
                break;
            }
        }
    }
    else {
        errorDisplay('notEnoughMoney');
    }
}

function buyBoost() {
    const currentBoost = event.target;
    const currentPrice = Number(currentBoost.getAttribute('data-price'));
    const userMoney = Number(localStorage.getItem('currentMoney'));
    

    if (userMoney >= currentPrice) {
        localStorage.setItem('currentMoney', userMoney - currentPrice);
        document.getElementById('userMoney').textContent = `${Number(localStorage.getItem('currentMoney')).toLocaleString()}$`;

        const currentBoostType = currentBoost.getAttribute('data-boost');
        const allBoostLevel = document.querySelectorAll('.boostLevel');
        const allCurrentBoostLevel = document.querySelectorAll('.currentBoostLevel');

        const chanceList = makeChances();
        
        function upgradeBoost(index) {
            const maxLevel = Number(allBoostLevel[index].getAttribute('data-levelMax'));
            const boost = allBoostLevel[index];
            const boostLevel = allCurrentBoostLevel[index];
			let currentLevel = Number(allBoostLevel[index].textContent.slice(0, allBoostLevel[index].textContent.indexOf('/') - 1).replace('Level', ''));
			boost.textContent = `Level ${currentLevel + 1} / ${maxLevel}`;
            boostLevel.style.width = `${((currentLevel + 1) / maxLevel) * 100}%`;
            document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / chanceList.length) * 100) / 100}%`;

            const buttonEvent = event.target;
            if (currentLevel + 1 === maxLevel) {
                buttonEvent.textContent = 'MAX';
                buttonEvent.removeEventListener('click', buyBoost);
                buttonEvent.classList.add('notHover');
            }
            else {
                buttonEvent.textContent = `${
					currentPrice + Math.round((BOOST_INCREMENT_PRICE * BOOST_INCREMENT_PRICE_PER_LEVEL) * currentLevel)
				}$`;
                currentBoost.setAttribute('data-price', currentPrice + Math.round((BOOST_INCREMENT_PRICE * BOOST_INCREMENT_PRICE_PER_LEVEL) * currentLevel));
            }
        }
        if (currentBoostType === 'lucky') {
            const currentValue = Number(chanceDrawCard.crown);
            chanceDrawCard.crown = currentValue + CROWN_UPGRADE_VALUE;
			upgradeBoost(0);
        }
        else if (currentBoostType === 'investment') {
            MONEY_CARD_INCREMENT += BOOST_MONEY;
			upgradeBoost(1);
        }
        else if (currentBoostType === 'safetyDeal') {
            for (let index = 0; index < typeCardList.length; index++){
                const currentType = typeCardList[index];
                const currentValue = chanceDrawCard[currentType];
                chanceDrawCard[currentType] = currentValue - DOWN_CRISIS_UPGRADE_VALUE;
            }
            document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / chanceList.length) * 100) / 100}%`;
			upgradeBoost(2);
        }
        else if (currentBoostType === 'leadership') {
            totalPercentDown += CROWN_PRICE_DOWN_UPGRADE_VALUE;

            const allCrownDiv = document.querySelectorAll('.crownDiv');
            for (let index = 0; index < allCrownDiv.length; index++) {
                const currentCrown = allCrownDiv[index];
                console.log(currentCrown.getAttribute('data-value') === 'blank');
                if (currentCrown.getAttribute('data-value') === 'blank') {
                    const nextPrice = Math.round(
						DEFAULT_CROWN_PRICE[index] - DEFAULT_CROWN_PRICE[index] * (totalPercentDown / 100)
                    );
                    document.querySelector('.buyCrownButton').setAttribute('data-price', nextPrice);
                    document.querySelector('.buyCrownButton').textContent = `${nextPrice}$`;
                    break;
                }
            }
			upgradeBoost(3);
        }
        else if (currentBoostType === 'protection') {
			const currentChance = Number(chanceDrawCard.warDefence);
			chanceDrawCard.warDefence = currentChance + SHIELD_UPGRADE_VALUE;
			console.log(chanceDrawCard.warDefence);
			upgradeBoost(4);
		}
    }
    else {
        errorDisplay('notEnoughMoney');
    }
}

function errorDisplay(currentError) {
    const getX = event.clientX;
    const getY = event.clientY;
    
    const errorDiv = document.createElement('div');
    
    if (currentError === 'notEnoughMoney') {
        errorDiv.textContent = 'Not enough money';
    }
    else if (currentError === 'noCorrectCard') {
        errorDiv.textContent = 'Action card needed';
    }
    else if (currentError === 'crisisSolved') {
        errorDiv.textContent = 'Crisis already Solved';
    }
    else if (currentError === 'notPossibleDecrement') {
        errorDiv.textContent = 'Action is not possible';
    }
    errorDiv.classList.add('errorDiv');
    errorDiv.style.top = `${getY - 20}px`;
    errorDiv.style.width = 'fit-content';
    document.body.appendChild(errorDiv);
    
    const webWidth = window.innerWidth;
    if (getX + (errorDiv.offsetWidth / 2) > webWidth) {
        errorDiv.style.left = `${webWidth - (errorDiv.offsetWidth + 10)}px`;
    }
    else {
        errorDiv.style.left = `${getX - (errorDiv.offsetWidth / 2)}px`;
    }
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 950);
}

let drawingCardAnimation = false;

function drawCard() {
    if (!drawingCardAnimation) {
        drawingCardAnimation = true;
        const allCurrentChance = makeChances();
        console.log(allCurrentChance);
        
        const allEventContainer = document.querySelectorAll('.eventContainer');
		const cardImgSrc = {
			money: 'coinEventImg.png',
			warDefence: 'shieldImage.png',
			crown: 'crownImage.png',
			attackCrown: 'swordImage.png',
		};

		const revealCardDiv = document.querySelector('.revealCard');
		let currentEvent = allCurrentChance[Math.floor(Math.random() * allCurrentChance.length)];
		console.log(currentEvent);
		if (!typeCardList.includes(currentEvent)) {
			document.querySelector('.cardBack').src = cardImgSrc[currentEvent];
		} else {
			const eventLevel = Number(allEventContainer[typeCardList.indexOf(currentEvent)].getAttribute('data-level'));
			if (eventLevel === 1) {
				document.querySelector('.cardBack').src = level3_Card[typeCardList.indexOf(currentEvent)];
			} else if (eventLevel === 3) {
				document.querySelector('.cardBack').src = level5_Card[typeCardList.indexOf(currentEvent)];
			}
        }
        
        for (let index = 0; index < allEventContainer.length; index++) {
			allEventContainer[index].removeEventListener('click', decreaseCrisis);
		}

		revealCardDiv.classList.add('rotateAnimation');
		revealCardDiv.style.display = 'block';
		document.querySelector('.drawDeckDiv').removeEventListener('click', drawCard);
		document.querySelector('.buyCrownButton').removeEventListener('click', buyCrown);

		setTimeout(() => {
			revealCardDiv.classList.remove('rotateAnimation');
			document.querySelector('.latestCardDrawn').style.display = 'block';
			document.querySelector('.latestCardImg').src = document.querySelector('.cardBack').src;
			resolveCard(currentEvent);
		}, 2000);   
    }
}

function createAnimation(currentCard) {
	const randomDuration = Math.floor(Math.random() * 5000) + 3000;
	const randomOrientation = Math.round(Math.random()) === 0;

	currentCard.style.animationDuration = `${randomDuration}ms`;
	if (randomOrientation) {
		currentCard.style.animationDirection = 'reverse';
	}
}

function resolveCard(action) {
    const chanceList = makeChances();
    function animationDone() {
        drawingCardAnimation = false;
        if (gameStillGoing) {
            document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / chanceList.length) * 100) / 100}%`;
            document.querySelector('.drawDeckDiv').addEventListener('click', drawCard);
            document.querySelector('.buyCrownButton').addEventListener('click', buyCrown);
    
            const allEventContainer = document.querySelectorAll('.eventContainer');
            for (let index = 0; index < allEventContainer.length; index++) {
                allEventContainer[index].addEventListener('click', decreaseCrisis);
            }   
        }
    }

    if (action === 'money') {
        const totalMoney = MONEY_CARD_INCREMENT + MONEY_CARD_VALUE;
        const moneyChanged = document.getElementById('moneyChanged');
        let addedMoney = 0;
        moneyChanged.style.display = 'block';
        moneyChanged.textContent = `${totalMoney}$`;
        moneyChanged.classList.add('disappearAnimation');
        moneyChanged.classList.add('addMoneyColor');
        function addMoney() {
            addedMoney++;
            let currentMoney = Number(localStorage.getItem('currentMoney')) + 1;
            document.getElementById('userMoney').textContent = `${currentMoney.toLocaleString()}$`;
            localStorage.setItem('currentMoney', currentMoney);

            if (addedMoney < totalMoney) {
                setTimeout(() => {
                    addMoney();
                }, 100)
            }
            else {
                animationDone(); 
            }
        }
        addMoney();

        setTimeout(() => {
            moneyChanged.style.display = 'none';
            moneyChanged.classList.remove('disappearAnimation');
        }, 1950);
    }
    else if (action === 'warDefence') {
        const allUserCard = document.querySelectorAll('.userCard');
        document.querySelector('.cardSlotNumber').textContent = `${allUserCard.length + 1}/2`;
        for (let index = 0; index < allUserCard.length; index++){
            allUserCard[index].classList.add('moveCardAnimation');
            allUserCard[index].style.animationDuration = `${1550}ms`;
            allUserCard[index].style.animationDirection = 'normal';
        }
        setTimeout(() => {
            const usableCardDiv = document.querySelector('.usableCardDiv');
			const cards = document.createElement('div');

			cards.classList.add('userCard');
            cards.classList.add('addingCardAnimation');
            cards.classList.add('cards');
            cards.style.animationDuration = `${1000}ms`;


			const userCardImg = document.createElement('img');
			userCardImg.src = 'shieldImage.png';
            userCardImg.classList.add('userCardImg');
			cards.appendChild(userCardImg);

            usableCardDiv.appendChild(cards);

            for (let index = 0; index < allUserCard.length; index++) {
				allUserCard[index].classList.remove('moveCardAnimation');
                createAnimation(allUserCard[index]);
			}

			setTimeout(() => {
                cards.classList.remove('addingCardAnimation');
                cards.setAttribute('data-action', 'decreaseCrisis');

                createAnimation(cards);
                animationDone(); 
			}, 950);
        }, 1500);
    }
    else if (action === 'crown') {
        const allCrownDiv = document.querySelectorAll('.crownDiv');
        let totalCrown = 1;
        for (let index = 0; index < allCrownDiv.length; index++) {
            const currentCrown = allCrownDiv[index];
            if (currentCrown.getAttribute('data-value') === 'blank') {
                currentCrown.classList.add('crownFlip');
                currentCrown.style.animationDuration = `${2000}ms`;
				currentCrown.style.animationDirection = 'normal';
                
                currentCrown.setAttribute('data-value', 'crown');
                if (totalCrown < 3) {
                    const nextPrice = Math.round(
                        DEFAULT_CROWN_PRICE[totalCrown] - DEFAULT_CROWN_PRICE[totalCrown] * (totalPercentDown / 100)
                    );
                    document.querySelector('.buyCrownButton').setAttribute('data-price', nextPrice);
                    document.querySelector('.buyCrownButton').textContent = `${nextPrice}$`;
                }

                setTimeout(() => {
                    const allFront = document.querySelectorAll('.front');
                    const allBack = document.querySelectorAll('.back');

                    allCrownDiv[index].classList.remove('crownFlip');
                    allFront[index].classList.remove('front');
                    allFront[index].classList.add('back');
                    
                    allBack[index].classList.remove('back');
                    allBack[index].classList.add('front');
                    createAnimation(currentCrown);
                    for (let index = 0; index < typeCardList.length; index++){
                        const currentType = typeCardList[index];
                        const currentValue = chanceDrawCard[currentType];
                        chanceDrawCard[currentType] = currentValue - DOWN_CRISIS_UPGRADE_VALUE;
                    }
                    document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / chanceList.length) * 100) / 100}%`;
                    if (totalCrown === 3) {
						gameWin();
					}
                    animationDone(); 
                }, 1950);
                break;
            }
            totalCrown++;
        }
    }
    else if (action === 'attackCrown') {
        const allCrownDiv = document.querySelectorAll('.crownDiv');
		for (let index = allCrownDiv.length - 1; index >= 0; index--) {
			const currentCrown = allCrownDiv[index];
            if (currentCrown.getAttribute('data-value') === 'crown') {
                const nextPrice = Math.round(
					DEFAULT_CROWN_PRICE[index] - DEFAULT_CROWN_PRICE[index] * (totalPercentDown / 100)
				);
				document.querySelector('.buyCrownButton').setAttribute('data-price', nextPrice);
                document.querySelector('.buyCrownButton').textContent = `${nextPrice}$`;
                
                currentCrown.style.animationDuration = `${2000}ms`;
				currentCrown.style.animationDirection = 'normal';
				currentCrown.classList.add('crownFlip');

				currentCrown.setAttribute('data-value', 'blank');
				setTimeout(() => {
					const allFront = document.querySelectorAll('.front');
					const allBack = document.querySelectorAll('.back');

					allCrownDiv[index].classList.remove('crownFlip');
					allFront[index].classList.remove('front');
					allFront[index].classList.add('back');

					allBack[index].classList.remove('back');
                    allBack[index].classList.add('front');
                    createAnimation(currentCrown);
				}, 1950);
				break;
			}
        }
        setTimeout(() => {
            for (let index = 0; index < typeCardList.length; index++){
                const currentType = typeCardList[index];
                const currentValue = chanceDrawCard[currentType];
                chanceDrawCard[currentType] = currentValue - DOWN_CRISIS_UPGRADE_VALUE;
            }
            document.querySelector('.eventChance').textContent = `${Math.round(((chanceDrawCard['crown'] * 100) / chanceList.length) * 100) / 100}%`;
			animationDone();
		}, 1950); 
    }
    else if (typeCardList.includes(action)) {
        const allCardDiv = document.querySelectorAll('.eventContainer');
        const currentIndex = typeCardList.indexOf(action);
        let currentCardDiv = allCardDiv[currentIndex];
        let eventImage = document.querySelectorAll('.currentEventImage')[currentIndex];
        let currentNextEventImage = document.querySelectorAll('.nextEventImage')[currentIndex];

        console.log(currentCardDiv)
        console.error('ERORRRR')
        currentCardDiv.style.animationDuration = `${2000}ms`;
		currentCardDiv.style.animationDirection = 'normal';
        currentCardDiv.classList.add('crownFlip');

        setTimeout(() => {
            const crisisLevel = Number(currentCardDiv.getAttribute('data-level'));
            eventImage.src = currentNextEventImage.src;

            if (crisisLevel === 0) {
                currentCardDiv.setAttribute('data-level', 1);
                currentNextEventImage.src = level3_Card[currentIndex];
            }
            else if (crisisLevel === 1) {
                currentCardDiv.setAttribute('data-level', 3);
                currentNextEventImage.src = level5_Card[currentIndex];
            }
            else if (crisisLevel === 3) {
                currentCardDiv.setAttribute('data-level', 5);
                let eventCondition = true;
                for (let index = 0; index < allCardDiv.length; index++){
                    if (Number(allCardDiv[index].getAttribute('data-level')) !== 0 &&
                        Number(allCardDiv[index].getAttribute('data-level')) !== 5) {
                        eventCondition = false;
                    }
                }
                if (eventCondition) {
                    for (let index = 0; index < allCardDiv.length; index++){
                        if (Number(allCardDiv[index].getAttribute('data-level')) === 0) {
                            const allNextImage = document.querySelectorAll('.nextEventImage');
                            allNextImage[index].src = level1_Card[index];
                            console.log(allNextImage[index]);
                            resolveCard(allCardDiv[index].getAttribute('data-event'));
                        }
                    }
                }
            }

            let gameIsOver = true;
            for (let index = 0; index < allCardDiv.length; index++){
                if (Number(allCardDiv[index].getAttribute('data-level')) < 5) {
                    gameIsOver = false;
                }
            }

            if (gameIsOver) {
                gameOver();
            }
            currentCardDiv.classList.remove('crownFlip');

            createAnimation(currentCardDiv);
            animationDone();
        }, 1950);
	}
}

function gameOver() {
    const eventContainer = document.querySelectorAll('.eventContainer');
    for (let index = 0; index < eventContainer.length; index++){
        eventContainer[index].removeEventListener('click', decreaseCrisis);
    }
    const buttonBuy = document.querySelectorAll('.boostUpgradeButton');
	for (let index = 0; index < buttonBuy.length; index++) {
		buttonBuy[index].removeEventListener('click', buyBoost);
    }
    lastDraw('lost');
}

function gameWin() {
    const eventContainer = document.querySelectorAll('.eventContainer');
	for (let index = 0; index < eventContainer.length; index++) {
		eventContainer[index].removeEventListener('click', decreaseCrisis);
    }
    const buttonBuy = document.querySelectorAll('.boostUpgradeButton');
	for (let index = 0; index < buttonBuy.length; index++) {
		buttonBuy[index].removeEventListener('click', buyBoost);
    }
    lastDraw('win');
}

function lastDraw(condition) {
    const revealCardDiv = document.querySelector('.revealCard');
    document.querySelector('.cardDeckDiv').style.display = 'none';

    if (condition === 'win') {
        document.querySelector('.cardBack').src = 'winCardEvent.png';
    }
    else if (condition === 'lost') {
        document.querySelector('.cardBack').src = 'gameOverCard.png';
    }
    revealCardDiv.classList.add('rotateAnimation');
	revealCardDiv.style.display = 'block';
	document.querySelector('.drawDeckDiv').removeEventListener('click', drawCard);
    document.querySelector('.buyCrownButton').removeEventListener('click', buyCrown);
    document.querySelector('.buyCrownButton').textContent = '-';

    gameStillGoing = false;
	setTimeout(() => {
		revealCardDiv.classList.remove('rotateAnimation');
		document.querySelector('.latestCardDrawn').style.display = 'block';
		document.querySelector('.latestCardImg').src = document.querySelector('.cardBack').src;
	}, 2000);
}

startGame();
