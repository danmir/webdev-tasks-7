define('browserAPI', [], () => {
    function onCharger (callback) {
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
                    callback();
                    // ee.emitEvent('chargerAction');
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
    }

    function onDark (callback) {
        if ('ondevicelight' in window) {
            console.log('Датчик освещенности поддерживается');
            window.ondevicelight = function (e) {
                if (e.value < 5) {
                    callback();
                    //ee.emitEvent('darkAction');
                }
            };
        } else {
            console.log('Датчик освещенности не поддерживается');
        }
    }

    function onVisibilityChange (onVisible, onHidden) {
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
                onHidden();
                //ee.emitEvent('awayAction');
            } else {
                onVisible();
                //ee.emitEvent('comeBackAction');
            }
        });
    }

    return {onCharger, onDark, onVisibilityChange}

});