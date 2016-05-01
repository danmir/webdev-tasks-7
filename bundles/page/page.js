require('file?name=page.html!./page.html');
require('file?name=pig.svg!./pig.svg');
require('file?name=sleep.svg!./sleep.svg');
require('./page.css');

function printVal(state, param) {
    var idNode = document.getElementById(param);
    idNode.innerHTML = state[param];
}

// Изменение состояния объекта
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

define('page', ['./svgLoad.js', './browserAPI.js'], function (svgLoad, browserAPI) {
    svgLoad.then((s) => {
        var state;
        var satietyChanger;
        var energyChanger;
        var moodChanger;
        var decSpeed = 3000;
        var incSpeed = 1000;

        var EventEmitter = require('wolfy87-eventemitter');
        var ee = new EventEmitter();

        // Кнопка для возвращения к начальному состоянию
        var startOverButton = document.getElementById('start-over');
        startOverButton.onclick = () => {
            localStorage.removeItem('pig-state');
            clearInterval(energyChanger);
            clearInterval(satietyChanger);
            clearInterval(moodChanger);
            if (state.isDead) {
                reanimatePigAnimation();
            }
            preparePig();
        };

        // Подготовка начального состояния
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
                isListening: false,
                isDead: false
            };
            printVal(state, 'satiety');
            printVal(state, 'energy');
            printVal(state, 'mood');

            listeningHandler('stop');
            sleepingHandler('stop');
            eatingHandler('stop');
        }

        // Проверим, доступно ли хранилище
        var isLocalAvailable = false;
        try {
            localStorage.setItem('key', 'value');
            localStorage.removeItem('key');
            isLocalAvailable = true;
        } catch (error) {
            console.log('Local Storage не доступен');
        }
        if (isLocalAvailable) {
            // Если доступно - попробуем восстановить предыдущее состояние
            var stateString = localStorage.getItem('pig-state');
            if (stateString) {
                state = JSON.parse(stateString);
                console.log(state);

                if (!state.isDead) {
                    // Теперь восстановим движение всех характеристик
                    state.isEating ? eatingHandler('start') : eatingHandler('stop');
                    state.isListening ? listeningHandler('start') : listeningHandler('stop');
                    state.isSleeping ? sleepingHandler('start') : sleepingHandler('stop');
                } else {
                    deadAnimation();
                }

                printVal(state, 'satiety');
                printVal(state, 'energy');
                printVal(state, 'mood');
            }
        }

        //Сохранение текущего состояния
        function saveState() {
            if (isLocalAvailable) {
                localStorage.setItem('pig-state', JSON.stringify(state));
            }
        }

        // Если не смогли получить пердыдущее состояние - грузим стандартное
        if (!state) {
            preparePig();
        }

        // Анимации состояний и переходов в состояния
        function wakingUpAnimation() {
            var sleep = s.select('#Sleep');
            if (sleep.attr('opacity') === '1') {
                sleep.animate({
                    opacity: '0'
                }, 100, mina.easeinout);
            }
        }

        function sleepingAnimation() {
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
        }

        function stopEatingAnimation() {
            var mouth = s.select('#mouth');
            mouth.animate({
                transform: 'translate(38, 91)'
            }, 250);
        }

        function eatingAnimation() {
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
        }

        function putOnSleepMaskAnimation() {
            var sleepMask = s.select('#Sleep-Mask');
            sleepMask.animate({
                'fill-opacity': 1,
                'stroke-opacity': 1
            }, 5000);
        }

        function putOffSleepMaskAnimation() {
            var sleepMask = s.select('#Sleep-Mask');
            sleepMask.animate({
                'fill-opacity': 0,
                'stroke-opacity': 0
            }, 5000);
        }

        function deadAnimation() {
            var pig = s.select('#Pig');
            console.log('deadAnimation');
            //pig.attr({transform: 'rotate(180deg)'});
            pig.animate({transform: 'translate(0, 0)'}, 10, mina.easeinout, () => {
                pig.animate({
                    transform: 'rotate(180deg)'
                }, 3000);
            });
        }

        function reanimatePigAnimation() {
            var pig = s.select('#Pig');
            pig.animate({transform: 'translate(0, 0)'}, 10, mina.easeinout, () => {
                pig.animate({
                    transform: 'rotate(0deg)'
                }, 3000);
            });
        }

        // Обработка изменений в состояниях
        function isDeadChecker() {
            if ((!state.mood && !state.satiety) ||
                (!state.mood && !state.energy) ||
                (!state.energy && !state.satiety))
            {
                console.log('Pig is dead');
                state.isDead = true;
                deadAnimation();
                saveState();

                clearInterval(energyChanger);
                clearInterval(satietyChanger);
                clearInterval(moodChanger);
            }
        }
        function sleepingHandler(toState) {
            saveState();
            if (toState === 'stop') {
                putOffSleepMaskAnimation();
                state.isSleeping = false;
                clearInterval(energyChanger);
                energyChanger = setInterval(() => {
                    wakingUpAnimation();

                    changeVal('dec', state, 'energy');
                    printVal(state, 'energy');
                    isDeadChecker();
                }, decSpeed);
            }
            if (toState === 'start') {
                if (!state.isDead) {
                    putOnSleepMaskAnimation();
                    state.isSleeping = true;
                    clearInterval(energyChanger);
                    energyChanger = setInterval(() => {
                        sleepingAnimation();

                        changeVal('inc', state, 'energy');
                        if (state.energy === 100) {
                            ee.emitEvent('fullEnergyAction');
                        }
                        printVal(state, 'energy');
                        isDeadChecker();
                    }, incSpeed);
                }
            }
        }

        function eatingHandler(toState) {
            saveState();
            if (toState === 'stop') {
                state.isEating = false;
                clearInterval(satietyChanger);
                satietyChanger = setInterval(() => {
                    stopEatingAnimation();

                    changeVal('dec', state, 'satiety');
                    printVal(state, 'satiety');
                    isDeadChecker();
                }, decSpeed);
            }
            if (toState === 'start') {
                if (!state.isDead) {
                    state.isEating = true;
                    clearInterval(satietyChanger);
                    satietyChanger = setInterval(() => {
                        eatingAnimation();

                        changeVal('inc', state, 'satiety');
                        if (state.satiety === 100) {
                            ee.emitEvent('fullSatietyAction');
                        }
                        printVal(state, 'satiety');
                    }, incSpeed);
                }
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
                }, decSpeed);
            }
            if (toState === 'start') {
                if (!state.isDead) {
                    state.isListening = true;
                    clearInterval(moodChanger);
                    moodChanger = setInterval(() => {
                        changeVal('inc', state, 'mood');
                        if (state.mood === 100) {
                            ee.emitEvent('fullMoodAction');
                        }
                        printVal(state, 'mood');
                    }, incSpeed);
                }
            }
        }


        // Обработка всех событий свинки
        function darkHandler() {
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
            // Анимация не происходит, если уйти с вкладки
            if (!state.isDead) {
                var sleepMask = s.select('#Sleep-Mask');
                if (sleepMask.attr('fill-opacity') != '1') {
                    sleepMask.attr({'fill-opacity': 1});
                    sleepMask.attr({'stroke-opacity': 1});
                }
            }
            if (state.isSleeping) {
                sleepingHandler('stop');
            }
        }
        ee.addListener('comeBackAction', comeBackHandler);

        function chargerHandler() {
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
            if (state.isSleeping) {
                sleepingHandler('stop');
            }
        }
        ee.addListener('fullEnergyAction', fullEnergyHandler);

        function fullSatietyHandler() {
            if (state.isEating) {
                eatingHandler('stop');
            }
        }
        ee.addListener('fullSatietyAction', fullSatietyHandler);

        function fullMoodHandler() {
            if (state.isListening) {
                listeningHandler('stop');
            }
        }
        ee.addListener('fullMoodAction', fullMoodHandler);


        // Вешаем события на API браузера
        browserAPI.onCharger(() => {ee.emitEvent('chargerAction')});
        browserAPI.onDark(() => {ee.emitEvent('darkAction');});
        browserAPI.onVisibilityChange(() => {ee.emitEvent('comeBackAction');},
            () => {ee.emitEvent('awayAction');});

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
    });
});