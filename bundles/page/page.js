require('file?name=page.html!./page.html');
require('file?name=pig.svg!./pig.svg');
require('file?name=sleep.svg!./sleep.svg');
require('./page.css');

var state;
var satietyChanger;
var energyChanger;
var moodChanger;
var decSpeed = 3000;
var incSpeed = 1000;

var EventEmitter = require('wolfy87-eventemitter');
var ee = new EventEmitter();

// Проверим, доступно ли хранилище
var isLocalAvaliable = false;
try {
    localStorage.setItem('key', 'value');
    localStorage.removeItem('key');
    isLocalAvaliable = true;
} catch (error) {
    console.log('Local Storage не доступен');
}
if (isLocalAvaliable) {
    // Если доступно - попробуем восстановить предыдущее состояние
    var stateString = localStorage.getItem('pig-state');
    if (stateString) {
        state = JSON.parse(stateString);
        console.log(state);
        // Теперь восстановим движение всех характеристик
        if (state.isEating) {
            eatingHandler('start');
        } else {
            eatingHandler('stop');
        }
        if (state.isListening) {
            listeningHandler('start');
        } else {
            listeningHandler('stop');
        }
        if (state.isSleeping) {
            sleepingHandler('start');
        } else {
            sleepingHandler('stop');
        }
        printVal(state, 'satiety');
        printVal(state, 'energy');
        printVal(state, 'mood');
    }
}

// Если не смогли получить пердыдущее состояние - грузим стандартное
function preparePig() {
    state = {
        // Показатели хрюнделя
        satiety: 100,
        energy: 100,
        mood: 100,
        // Состояния хрюнделя
        isSleeping: false,
        isIdle: true,
        isEating: false,
        isListening: false
    };
    printVal(state, 'satiety');
    printVal(state, 'energy');
    printVal(state, 'mood');
    satietyChanger = setInterval(() => {
        changeVal('dec', state, 'satiety');
        printVal(state, 'satiety');
        saveState();
    }, decSpeed);
    energyChanger = setInterval(() => {
        changeVal('dec', state, 'energy');
        printVal(state, 'energy');
        saveState();
    }, decSpeed);
    moodChanger = setInterval(() => {
        changeVal('dec', state, 'mood');
        printVal(state, 'mood');
        saveState();
    }, decSpeed);
}
if (!state) {
    preparePig();
}

var startOverButton = document.getElementById('start-over');
startOverButton.onclick = () => {
    localStorage.removeItem('pig-state');
    clearInterval(energyChanger);
    clearInterval(satietyChanger);
    clearInterval(moodChanger);
    preparePig();
};

var Snap = require("imports-loader?this=>window,fix=>module.exports=0!./snap.svg");
var s = Snap("#pig-svg");

Snap.load('static/pig.svg', function (response) {
    var pigSvg = response;
    s.append(pigSvg);
    //var pig = s.select('#Pig');
    var sleep = s.select('#Sleep');
    sleep.attr({
        opacity: 0
    });
});

function printVal(state, param) {
    var idNode = document.getElementById(param);
    idNode.innerHTML = state[param];
}

function changeVal(dir, state, param) {
    if (dir === 'inc') {
        if (state[param] < 100) {
            state[param] += 1;
        }
    }
    if (dir === 'dec') {
        if (state[param] > 0) {
            state[param] -= 1;
        }
    }
    //console.log(state);
}

//State save
function saveState() {
    if (isLocalAvaliable) {
        localStorage.setItem('pig-state', JSON.stringify(state));
    }
}

// State changing handlers
function sleepingHandler(toState) {
    if (toState === 'stop') {
        state.isSleeping = false;
        clearInterval(energyChanger);
        energyChanger = setInterval(() => {
            var sleep = s.select('#Sleep');
            if (sleep.attr('opacity') === '1') {
                sleep.animate({
                    opacity: '0'
                }, 100, mina.easeinout);
            }

            changeVal('dec', state, 'energy');
            printVal(state, 'energy');
            saveState();
        }, decSpeed);
    }
    if (toState === 'start') {
        state.isSleeping = true;
        clearInterval(energyChanger);
        energyChanger = setInterval(() => {
            var sleep = s.select('#Sleep');
            if (sleep.attr('opacity') === '0') {
                sleep.attr({opacity: 1});
            }
            sleep.animate({
                transform: 'scale(1.5, 1.5)'
            }, 500, mina.easeinout, () => {
                sleep.animate({
                    transform: 'scale(0.5, 0.5)'
                }, 500, mina.easeinout)
            });

            changeVal('inc', state, 'energy');
            if (state.energy === 100) {
                ee.emitEvent('fullEnergyAction');
            }
            printVal(state, 'energy');
            saveState();
        }, incSpeed);
    }
}

function eatingHandler(toState) {
    saveState();
    if (toState === 'stop') {
        state.isEating = false;
        clearInterval(satietyChanger);
        satietyChanger = setInterval(() => {
            var mouth = s.select('#mouth');
            mouth.animate({
                transform: 'translate(38, 91)'
            }, 250);

            changeVal('dec', state, 'satiety');
            printVal(state, 'satiety');
            saveState();
        }, decSpeed);
    }
    if (toState === 'start') {
        state.isEating = true;
        clearInterval(satietyChanger);
        satietyChanger = setInterval(() => {
            var mouth = s.select('#mouth');
            mouth.animate({
                transform: 'translate(38, 80)'
            }, 250, mina.easeinout, () => {
                mouth.animate({
                    transform: 'translate(25, 85)'
                }, 250, mina.easeinout, () => {
                    mouth.animate({
                        transform: 'translate(38, 80)'
                    }, 250, mina.easeinout, () => {
                        mouth.animate({
                            transform: 'translate(51, 85)'
                        }, 250, mina.easeinout, () => {
                            mouth.animate({
                                transform: 'translate(38, 91)'
                            }, 250);
                        });
                    });
                });
            });

            changeVal('inc', state, 'satiety');
            if (state.satiety === 100) {
                ee.emitEvent('fullSatietyAction');
            }
            printVal(state, 'satiety');
            saveState();
        }, incSpeed);
    }
}

function listeningHandler(toState) {
    saveState();
    if (toState === 'stop') {
        if (recognizer) {
            console.log('Stop recognizer');
            recognizer.stop();
            log.innerHTML = '';
        }
        state.isListening = false;
        clearInterval(moodChanger);
        moodChanger = setInterval(() => {
            changeVal('dec', state, 'mood');
            printVal(state, 'mood');
            saveState();
        }, decSpeed);
    }
    if (toState === 'start') {
        state.isListening = true;
        clearInterval(moodChanger);
        moodChanger = setInterval(() => {
            changeVal('inc', state, 'mood');
            if (state.mood === 100) {
                ee.emitEvent('fullMoodAction');
            }
            printVal(state, 'mood');
            saveState();
        }, incSpeed);
    }
}


// Actions handlers
function darkHandler() {
    // Меняем состояние
    if (state.isListening) {
        listeningHandler('stop');
    }
    if (state.isEating) {
        eatingHandler('stop');
    }
    sleepingHandler('start');
}
ee.addListener('darkAction', darkHandler);

function awayHandler() {
    // Меняем состояние
    if (state.isListening) {
        listeningHandler('stop');
    }
    if (state.isEating) {
        eatingHandler('stop');
    }
    sleepingHandler('start');
}
ee.addListener('awayAction', awayHandler);

function comeBackHandler() {
    // Меняем состояние
    if (state.isSleeping) {
        sleepingHandler('stop');
    }
}
ee.addListener('comeBackAction', comeBackHandler);

function chargerHandler() {
    // Меняем состояние
    if (state.isListening) {
        listeningHandler('stop');
    }
    // По условию сон не прерывается питанием
    // Но состояние может быть только одно по условию -> буду прерывать
    if (state.isSleeping) {
        sleepingHandler('stop');
    }
    eatingHandler('start');
}
ee.addListener('chargerAction', chargerHandler);

function clickHandler() {
    // Меняем состояние
    if (state.isEating) {
        eatingHandler('stop');
    }
    if (state.isSleeping) {
        sleepingHandler('stop');
    }
    listeningHandler('start');
}
ee.addListener('clickAction', clickHandler);

function fullEnergyHandler() {
    // Меняем состояние
    if (state.isSleeping) {
        sleepingHandler('stop');
    }
}
ee.addListener('fullEnergyAction', fullEnergyHandler);

function fullSatietyHandler() {
    // Меняем состояние
    if (state.isEating) {
        eatingHandler('stop');
    }
}
ee.addListener('fullSatietyAction', fullSatietyHandler);

function fullMoodHandler() {
    // Меняем состояние
    if (state.isListening) {
        listeningHandler('stop');
    }
}
ee.addListener('fullMoodAction', fullMoodHandler);
//

// Далее вешаем события на API браузера
// Определяем событие батарейки
if (navigator.getBattery) {
    console.log('Есть доступ к батарейке');
    navigator
        .getBattery()
        .then(initBattery);

    function updateLevel() {
        //console.log((this.level * 100).toFixed(2) + '%');
    }

    function updateCharging() {
        var onOff = this.charging ? 'on' : 'off';
        console.log('Charger is ' + onOff);
        if (onOff === 'on') {
            ee.emitEvent('chargerAction');
        }
    }

    function initBattery(battery) {
        battery.onlevelchange = updateLevel;
        battery.onlevelchange();

        battery.onchargingchange = updateCharging;
        //battery.onchargingchange();
    }
} else {
    console.log('Нет доступа к батарейке');
    // Показывать кнопку для питания
}

if ('ondevicelight' in window) {
    console.log('Датчик освещенности поддерживается');
    window.ondevicelight = function (e) {
        if (e.value < 5) {
            ee.emitEvent('darkAction');
        }
    };
} else {
    console.log('Датчик освещенности не поддерживается');
}

// Определяем событие покидания вкладки
var hidden = null;
var visibilityState = null;
var visibilityChange = null;
if ('hidden' in document) {
    hidden = 'hidden';
    visibilityState = 'visibilityState';
    visibilityChange = 'visibilitychange';
} else if ('mozHidden' in document) {
    hidden = 'mozHidden';
    visibilityState = 'mozVisibilityState';
    visibilityChange = 'mozvisibilitychange';
} else if ('webkitHidden' in document) {
    hidden = 'webkitHidden';
    visibilityState = 'webkitVisibilityState';
    visibilityChange = 'webkitvisibilitychange';
}
document.addEventListener(visibilityChange, function () {
    console.log([
        '----------------',
        'Hidden: ' + document[hidden],
        'State : ' + document[visibilityState],
        '----------------'
    ].join('\n'));
    if (document[hidden]) {
        console.log('hidden');
        ee.emitEvent('awayAction');
    } else {
        ee.emitEvent('comeBackAction');
    }
});

// Определяем возможность распознования голоса
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognizer = new SpeechRecognition();
recognizer.lang = 'en-US';
// продолжает слушать и расопзнавать речь даже после паузы
recognizer.continuous = true;     // false по умолчанию
// повзоляет получать промежуточные результаты
recognizer.interimResults = true; // false по умолчанию
var log = document.getElementById('speech-log');
var pig = document.getElementById('pig-svg');
pig.onclick = function () {
    log.innerHTML = 'Хрюндель у аппарата';
    recognizer.start();
    ee.emitEvent('clickAction');
};
recognizer.onresult = function (e) {
    console.log(e);
    var index = e.resultIndex;
    var result = e.results[index][0].transcript.trim();
    log.innerHTML = result;
};
recognizer.onerror = function (e) {
    console.log(e);
    log.innerHTML = 'Хрюндель не смог распознать голос, но все равно радуется';
};