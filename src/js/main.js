

const main = (function() {

    return function() {
        const canvas = document.getElementById('canvas');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const gl = canvas.getContext('webgl');

        // ensure that the WebGL context is available
        if (gl == null) {
            alert('WebGL is unavailable');
            return;
        }

        var floatTextures = gl.getExtension('OES_texture_float');
        if (!floatTextures) {
            alert('No floating point texture support');
            return;
        }

        var floatTexturesLinear = gl.getExtension('OES_texture_float_linear');
        if (!floatTexturesLinear) {
            alert('No floating point linear texture support');
            return;
        }

        const settings = ShaderSettings.initSettingsData(gl);
        const buffers = ShaderBuffers.initBuffers(gl, settings);
        const programs = ShaderProgramDetails.initProgramDetails(gl);
        const menu = ShaderMenu.initMenu(gl, settings, buffers, programs);
        const mouse = ShaderMouse.initMouseHandler(gl, settings, buffers);
        const fps = ShaderFPS.initFPSCounter(settings);
       
        ShaderRender.drawPerlin(gl, programs.perlin, buffers, settings);
        ShaderRender.flipHeightmap(gl, programs.heightmap, buffers, settings);

        function draw() {
            fps.update();
            mouse.update();
            
            if (settings.render.refreshHeightmap) {
                ShaderRender.flipHeightmap(gl, programs.heightmap, buffers, settings);
                settings.mould = 0.0;
                settings.smooth = false;
                settings.render.refreshHeightmap = false;
            }

            if (settings.render.refreshDepth) {
                ShaderRender.drawScene(gl, programs.intersection, buffers, settings);
                settings.render.refreshDepth = false;
            }

            ShaderRender.drawCanvas(gl, programs.colour, buffers, settings);
            
            gl.finish();

            setTimeout(draw, 0);
        }

        draw();
    };
})();