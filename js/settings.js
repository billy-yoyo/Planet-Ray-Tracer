
const ShaderSettings = (function() {
    function normalize(v, negate) {
        var sum = 0.0;

        for (var i = 0; i < v.length; i++) {
            sum += v[i] * v[i];
        }
        
        sum = Math.sqrt(sum);
        
        var u = [];
        var coef = negate ? -1.0 : 1.0;

        for (var i = 0; i < v.length; i++) {
            u.push(coef * v[i] / sum);
        }

        return new Float32Array(u);
    }

    function initPlanetData() {
        return {
            origin: new Float32Array([0.0, 0.0, 5.0]),
            minRadius: 1.5,
            maxRadius: 2.5,
            atmosphereRadius: 2.5,
            waterLevel: 0.4,
            lastWaterLevel: 0.4
        };
    }

    function initViewData(gl) {
        return {
            up: new Float32Array([0.0, 1.0, 0.0]),
            right: new Float32Array([1.0, 0.0, 0.0]),
            forward: new Float32Array([0.0, 0.0, 1.0]),
            focalLength: 0.3,
            aspectRatio: 1,
            origin: new Float32Array([0.0, 0.0, 0.0]),
            rotation: new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]),
            rotationInverse: new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]),
            light: normalize([1.0, -1.0, 1.0], true),
            canvas: new Float32Array([0, 0])
        };
    }

    function initPerlinData() {
        return {
            size: 2048,
            width: 2048,
            height: 2048,
            persistence: 0.5,
            lacunarity: 2.0,
            blurRadius: 0.005,
            differential: 1.6,
            exaggeration: 1.7,
            octaves: 7
        };
    }

    function initRenderData() {
        return {
            supersampling: 2,
            hitAccuracy: 4,
            rayMarchStride: 0.005,
            shadows: false,
            refreshDepth: true,
            refreshHeightmap: false
        }
    }

    function initSettingsData(gl) {
        var data = {
            view: initViewData(gl),
            planet: initPlanetData(),
            perlin: initPerlinData(),
            render: initRenderData(),
            elapsed: 0.0,
            mould: 0.0,
            smooth: false,
            mousePos: {unit: new Float32Array([0, 0, 0]), data: -1.0},
        };  

        updateCanvasData(gl, data);

        return data;
    }

    function updateCanvasData(gl, settings) {
        settings.view.aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
        settings.view.canvas = new Float32Array([gl.canvas.clientWidth, gl.canvas.clientHeight]);
    }

    return {
        initPerlinData: initPerlinData,
        initSettingsData: initSettingsData,
        updateCanvasData: updateCanvasData
    };
})();