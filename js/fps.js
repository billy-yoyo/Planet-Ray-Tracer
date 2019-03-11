

const ShaderFPS = (function() {

    function initFPSCounter(settings) {
        const fpscounter = document.getElementById('fps');

        var lastTime = new Date().getTime();
        var frametimes = [];
        var index = 0;
        var maxframes = 100;

        function update() {
            var curTime = new Date().getTime();
            settings.elapsed = (curTime - lastTime) / 1000.0;
            lastTime = curTime;

            if (frametimes.length < maxframes) {
                frametimes.push(settings.elapsed);
            } else {
                frametimes[index] = settings.elapsed;
                index = (index + 1) % maxframes;
            }

            var avgframetime = 0;
            for (var i = 0; i < frametimes.length; i++) {
                avgframetime += frametimes[i];
            }
            avgframetime /= (0.0 + frametimes.length);
            var fps = 1.0 / avgframetime;

            fpscounter.innerText = 'FPS: ' + fps.toFixed(2);
        }

        return {
            update: update
        };
    }

    return {
        initFPSCounter: initFPSCounter
    };
})();