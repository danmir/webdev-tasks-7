var Snap = require("imports-loader?this=>window,fix=>module.exports=0!./snap.svg");

define('svgLoad', [], () => {
    var ss = function () {
        return new Promise((resolve, reject) => {
            var s = Snap("#pig-svg");
            Snap.load('static/pig.svg', function (response) {
                s.append(response);

                // Выставляем начальные состояния
                var sleep = s.select('#Sleep');
                sleep.attr({opacity: 0});

                var sleepMask = s.select('#Sleep-Mask');
                sleepMask.attr({'fill-opacity': 0, 'stroke-opacity': 0});

                resolve(s);
            });
        });
    };
    return ss();
    // var foo = async function() {
    //     var res = await ss();
    //     return res;
    // };
    // return await foo();
});