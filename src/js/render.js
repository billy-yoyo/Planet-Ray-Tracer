

const ShaderRender = (function() {
    function bindArray(gl, location, buffer, opts) {
        if (!opts) { opts = {}; }

        const numComponents = opts.numComponents || 2;
        const type = opts.type || gl.FLOAT;
        const normalize = opts.normalize ? true : false;
        const stride = opts.stride ? opts.stride : 0;
        const offset = opts.offset ? opts.offset : 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            location,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(location);
    }

    function bindPosition(gl, programInfo, buffers) {
        bindArray(gl, programInfo.attribLocations.vertexPosition, buffers.position, {
            numComponents: 2
        });
    }

    function bindPerlinGradients(gl, programInfo, buffers) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, buffers.perlin);
        gl.uniform1i(programInfo.uniformLocations.perlinGradients, 0);
    }

    function bindHeightmap(gl, programInfo, buffers) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, buffers.perlinOutput.getLatest().texture);
        gl.uniform1i(programInfo.uniformLocations.heightmap, 1);
    }

    function bindHeightmapFlip(gl, programInfo, buffers) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, buffers.perlinOutput.getLatest().texture);
        gl.uniform1i(programInfo.uniformLocations.heightmap, 2);
    }

    function bindDepthmap(gl, programInfo, buffers) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, buffers.depthOutput.texture);
        gl.uniform1i(programInfo.uniformLocations.depthmap, 0);
    }

    function render(gl) {
        const offset = 0;
        const vertexCount = 4;

        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    function drawCanvas(gl, programInfo, buffers, settings) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        bindPosition(gl, programInfo, buffers);
        bindDepthmap(gl, programInfo, buffers);
        bindHeightmap(gl, programInfo, buffers);

        gl.uniform3fv(programInfo.uniformLocations.origin, settings.view.origin);
        gl.uniform3fv(programInfo.uniformLocations.light, settings.view.light);
        gl.uniform3fv(programInfo.uniformLocations.mouseUnit, settings.mousePos.unit);
        gl.uniform2fv(programInfo.uniformLocations.canvas, settings.view.canvas);
        gl.uniform1f(programInfo.uniformLocations.supersampling, settings.render.supersampling);
        gl.uniform1f(programInfo.uniformLocations.mouseData, settings.mousePos.data);
        gl.uniform1f(programInfo.uniformLocations.planetMinRadius, settings.planet.minRadius);
        gl.uniform1f(programInfo.uniformLocations.planetMaxRadius, settings.planet.maxRadius);
        gl.uniform1f(programInfo.uniformLocations.planetAtmosphereRadius, settings.planet.atmosphereRadius);
        gl.uniform3fv(programInfo.uniformLocations.planetOrigin, settings.planet.origin);

        gl.uniformMatrix3fv(programInfo.uniformLocations.rotation, false, settings.view.rotation);

        render(gl);
    }

    function drawScene(gl, programInfo, buffers, settings) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.depthOutput.fb);
        gl.viewport(0, 0, gl.canvas.width * settings.render.supersampling, gl.canvas.height * settings.render.supersampling);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        bindPosition(gl, programInfo, buffers);
        bindHeightmap(gl, programInfo, buffers);

        gl.uniform3fv(programInfo.uniformLocations.up, settings.view.up);
        gl.uniform3fv(programInfo.uniformLocations.right, settings.view.right);
        gl.uniform3fv(programInfo.uniformLocations.forward, settings.view.forward);
        gl.uniform3fv(programInfo.uniformLocations.origin, settings.view.origin);
        gl.uniform3fv(programInfo.uniformLocations.light, settings.view.light);
        gl.uniform1f(programInfo.uniformLocations.aspectRatio, settings.view.aspectRatio);
        gl.uniform1f(programInfo.uniformLocations.focalLength, settings.view.focalLength);
        gl.uniform1i(programInfo.uniformLocations.hitAccuracy, settings.render.hitAccuracy);
        gl.uniform1f(programInfo.uniformLocations.rayMarchStride, settings.render.rayMarchStride);
        gl.uniform1i(programInfo.uniformLocations.shadows, settings.render.shadows ? 1 : 0);
        gl.uniform1f(programInfo.uniformLocations.planetMinRadius, settings.planet.minRadius);
        gl.uniform1f(programInfo.uniformLocations.planetMaxRadius, settings.planet.maxRadius);
        gl.uniform1f(programInfo.uniformLocations.planetAtmosphereRadius, settings.planet.atmosphereRadius);
        gl.uniform3fv(programInfo.uniformLocations.planetOrigin, settings.planet.origin);

        gl.uniformMatrix3fv(programInfo.uniformLocations.rotation, false, settings.view.rotation);

        render(gl);
    }

    function drawPerlin(gl, programInfo, buffers, settings) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.perlinOutput.getLatest().fb);
        gl.viewport(0, 0, settings.perlin.width, settings.perlin.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        bindPosition(gl, programInfo, buffers);
        bindPerlinGradients(gl, programInfo, buffers);

        gl.uniform1f(programInfo.uniformLocations.perlinSize, settings.perlin.size);
        gl.uniform1f(programInfo.uniformLocations.persistence, settings.perlin.persistence);
        gl.uniform1f(programInfo.uniformLocations.lacunarity, settings.perlin.lacunarity);
        gl.uniform1f(programInfo.uniformLocations.blurRadius, settings.perlin.blurRadius);
        gl.uniform1f(programInfo.uniformLocations.differential, settings.perlin.differential);
        gl.uniform1f(programInfo.uniformLocations.exaggeration, settings.perlin.exaggeration);
        gl.uniform1i(programInfo.uniformLocations.octaves, settings.perlin.octaves);

        render(gl);
    }

    function flipHeightmap(gl, programInfo, buffers, settings) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.perlinOutput.getOldest().fb);
        gl.viewport(0, 0, settings.perlin.width, settings.perlin.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        bindPosition(gl, programInfo, buffers);
        bindHeightmapFlip(gl, programInfo, buffers);

        gl.uniform3fv(programInfo.uniformLocations.mouseUnit, settings.mousePos.unit);
        gl.uniform1f(programInfo.uniformLocations.mouseData, settings.mousePos.data);
        gl.uniform1f(programInfo.uniformLocations.mould, settings.mould);
        gl.uniform1i(programInfo.uniformLocations.smooth, settings.smooth ? 1 : 0);
        gl.uniform1f(programInfo.uniformLocations.waterLevel, settings.planet.waterLevel);
        gl.uniform1f(programInfo.uniformLocations.lastWaterLevel, settings.planet.lastWaterLevel);

        gl.uniformMatrix3fv(programInfo.uniformLocations.rotation, false, settings.view.rotation);
        gl.uniformMatrix3fv(programInfo.uniformLocations.rotationInverse, false, settings.view.rotationInverse);

        render(gl);

        buffers.perlinOutput.flip();
        settings.planet.lastWaterLevel = settings.planet.waterLevel;
    }

    return {
        drawScene: drawScene,
        drawPerlin: drawPerlin,
        drawCanvas: drawCanvas,
        flipHeightmap: flipHeightmap
    };
})();