
const ShaderMenu = (function() {

    function addValueUpdater(elt, updater, visualizer, valueid) {
        var valueElt = document.getElementById(valueid || elt.id + '-value');
        var oldValue = elt.value;

        if (!visualizer) {
            visualizer = function(v) { return '' + v; };
        }

        function onChange() {
            var val = parseFloat(elt.value);
            if (updater(val)) {
                elt.value = oldValue;
            } else {
                valueElt.innerText = visualizer(val);
                oldValue = elt.value;
            }
        }
        
        elt.addEventListener('input', onChange);
        onChange();

        elt.updateValue = function(v) {
            elt.value = v;
            onChange();
        };
    }

    function initPerlinMenu(gl, settings, buffers, programs) {
        var perlin = {
            refresh: document.getElementById('refresh-generation'),
            reset: document.getElementById('reset-generation'),
            persistence: document.getElementById('persistence'),
            lacunarity: document.getElementById('lacunarity'),
            differential: document.getElementById('differential'),
            exaggeration: document.getElementById('exaggeration'),
            blurRadius: document.getElementById('blur-radius'),
            octaves: document.getElementById('octaves'),
            resolution: document.getElementById('perlin-resolution')
        };

        addValueUpdater(perlin.persistence, function(v) { settings.perlin.persistence = v; });
        addValueUpdater(perlin.lacunarity, function(v) { settings.perlin.lacunarity = v; });
        addValueUpdater(perlin.differential, function(v) { settings.perlin.differential = v; });
        addValueUpdater(perlin.exaggeration, function(v) { settings.perlin.exaggeration = v; });
        addValueUpdater(perlin.blurRadius, function(v) { settings.perlin.blurRadius = v; });
        addValueUpdater(perlin.octaves, function(v) { settings.perlin.octaves = v; });
        addValueUpdater(perlin.resolution, function(v) { 
            settings.perlin.nextWidth = 2 ** v; 
            settings.perlin.nextHeight = 2 ** v; 
        }, function(v) { return 2 ** v; });

        perlin.refresh.addEventListener('click', function(e) {
            if (settings.perlin.nextWidth !== null && settings.perlin.nextWidth !== undefined) {
                settings.perlin.width = settings.perlin.nextWidth;
                settings.perlin.nextWidth = undefined;
            }

            if (settings.perlin.nextHeight !== null && settings.perlin.nextHeight !== undefined) {
                settings.perlin.height = settings.perlin.nextHeight;
                settings.perlin.nextHeight = undefined;
            }

            ShaderBuffers.refreshPerlin(gl, settings, buffers);
            ShaderRender.drawPerlin(gl, programs.perlin, buffers, settings);
            ShaderRender.flipHeightmap(gl, programs.heightmap, buffers, settings);
            settings.render.refreshDepth = true;
        });

        perlin.reset.addEventListener('click', function(e) {
            settings.perlin = ShaderSettings.initPerlinData();

            menu.perlin.persistence.updateValue(settings.perlin.persistence);
            menu.perlin.lacunarity.updateValue(settings.perlin.lacunarity); 
            menu.perlin.differential.updateValue(settings.perlin.differential);
            menu.perlin.blurRadius.updateValue(settings.perlin.blurRadius); 
            menu.perlin.octaves.updateValue(settings.perlin.octaves);
            menu.perlin.resolution.updateValue(11);
        });

        return perlin;
    }

    function initPlanetMenu(settings) {
        var planet = {
            waterlevel: document.getElementById('waterlevel'),
            minRadius: document.getElementById('min-radius'),
            maxRadius: document.getElementById('max-radius'),
            atmosphereRadius: document.getElementById('atmosphere-radius')
        };

        function updatePlanetProperties() {
            settings.render.refreshDepth = true;
            settings.render.refreshHeightmap = true;
        }

        addValueUpdater(planet.waterlevel, function(v) { settings.planet.waterLevel = v; updatePlanetProperties(); });
        addValueUpdater(planet.atmosphereRadius, function(v) { settings.planet.atmosphereRadius = v; updatePlanetProperties(); });

        addValueUpdater(planet.minRadius, function(v) { 
            if (v < settings.planet.maxRadius - 0.1) {
                settings.planet.minRadius = v; 
                updatePlanetProperties(); 
            } else {
                return true;
            }
        });

        addValueUpdater(planet.maxRadius, function(v) { 
            if (v > settings.planet.minRadius + 0.1) {
                settings.planet.maxRadius = v; 
                updatePlanetProperties(); 
            } else {
                return true;
            }
        });

        return planet;
    }

    function initLightValueUpdaters(render, settings) {
        var lightTheta;
        var lightPhi;

        function lightVisualizer(v) { 
            return '' + (lightTheta * (180 / Math.PI)).toFixed(1) + ', ' + (lightPhi * (180 / Math.PI)).toFixed(1) 
        }

        function lightUpdater() {
            var radius = Math.cos(lightPhi);
            var light = [-radius * Math.cos(lightTheta), -Math.sin(lightPhi), -radius * Math.sin(lightTheta)];
            
            settings.view.light = new Float32Array(light);
        }

        addValueUpdater(render.lightTheta, function(v) {
            lightTheta = v * Math.PI;
            lightUpdater();
        }, lightVisualizer, 'light-value');
        addValueUpdater(render.lightPhi, function(v) {
            lightPhi = v * Math.PI / 2.0;
            lightUpdater();
        }, lightVisualizer, 'light-value');
    }

    function initRenderMenu(gl, settings, buffers) {
        var render = {
            supersampling: document.getElementById('supersampling'),
            hitAccuracy: document.getElementById('hit-accuracy'),
            rayMarchStride: document.getElementById('ray-march-stride'),
            lightTheta: document.getElementById('light-theta'),
            lightPhi: document.getElementById('light-phi'),
            shadows: document.getElementById('shadows')
        };

        addValueUpdater(render.supersampling, function(v) { 
            settings.render.supersampling = v; 
            
            ShaderBuffers.refreshDepthOutput(gl, settings, buffers);
            settings.render.refreshDepth = true;
        }, function(v) { return 'x' + (v * v); });

        addValueUpdater(render.hitAccuracy, function(v) { 
            settings.render.hitAccuracy = v; 
            settings.render.refreshDepth = true;
        });

        addValueUpdater(render.rayMarchStride, function(v) { 
            settings.render.rayMarchStride = v; 
            settings.render.refreshDepth = true;
        });

        addValueUpdater(render.shadows, function(v) {
            settings.render.shadows = v == 1.0;
            settings.render.refreshDepth = true;
        }, function(v) { return v == 1 ? 'Enabled' : 'Disabled'; });

        initLightValueUpdaters(render, settings);

        return menu;
    }

    function initMenu(gl, settings, buffers, programs) {
        const menu = {
            elt: document.getElementById('menu'),
            button: document.getElementById('menu-button'),
            perlin: initPerlinMenu(gl, settings, buffers, programs),
            planet: initPlanetMenu(settings),
            render: initRenderMenu(gl, settings, buffers)
        };

        var showmenu = true;

        menu.button.addEventListener('click', function(e) {
            showmenu = !showmenu;

            if (showmenu) {
                menu.elt.style.right = '0px';
                menu.button.style.right = '250px';
            } else {
                menu.elt.style.right = '-250px';
                menu.button.style.right = '0px';
            }
        });

        return menu;
    }

    return {
        initMenu: initMenu
    };
})();