
const ShaderBuffers = (function() {

    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0
    ];

    function initPositionBuffer(gl) {
        const positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        return positionBuffer;
    }

    function initPerlinBuffer(gl, size) {
        const texture = gl.createTexture();
        
        var dataSet = [];
        var dirset = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];

        for (var i = 0; i < size * size; i++) {
            var dir = dirset[Math.floor(Math.random() * dirset.length)];
            dataSet.push(dir[0]);
            dataSet.push(dir[1]);
            dataSet.push(dir[2]);
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size, size, 0, gl.RGB, gl.FLOAT, new Float32Array(dataSet));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        return texture;
    }

    function initPerlinOutputTexture(gl, width, height) {
        var arr = [];
        
        for (var i = 0; i < 2; i++) {
            const texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            const attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

            arr.push({texture: texture, fb: fb});
        }

        var obj = {
            arr: arr,
            latest: 0,
            oldest: 1
        };

        obj.getLatest = function() {
            return obj.arr[obj.latest];
        };

        obj.getOldest = function() {
            return obj.arr[obj.oldest];
        };

        obj.flip = function() {
            var oldLatest = obj.latest, oldOldest = obj.oldest;
            obj.latest = oldOldest;
            obj.oldest = oldLatest;
        };

        return obj;
    }

    function initDepthOutputTexture(gl, settings) {
        const texture = gl.createTexture();

        const width = gl.canvas.width * settings.render.supersampling;
        const height = gl.canvas.height * settings.render.supersampling;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

        return {
            texture: texture,
            fb: fb
        };
    }

    function initBuffers(gl, settings) {
        return {
            position: initPositionBuffer(gl),
            perlin: initPerlinBuffer(gl, settings.perlin.size),
            perlinOutput: initPerlinOutputTexture(gl, settings.perlin.width, settings.perlin.height),
            depthOutput: initDepthOutputTexture(gl, settings)
        };
    }

    function refreshBuffers(gl, settings, buffers) {
        gl.deleteBuffer(buffers.position);

        gl.deleteTexture(buffers.perlin);
        
        gl.deleteFramebuffer(buffers.perlinOutput.arr[0].fb);
        gl.deleteFramebuffer(buffers.perlinOutput.arr[1].fb);

        gl.deleteTexture(buffers.perlinOutput.arr[0].texture);
        gl.deleteTexture(buffers.perlinOutput.arr[1].texture);

        gl.deleteFramebuffer(buffers.depthOutput.fb);
        gl.deleteTexture(buffers.depthOutput.texture);
        
        return initBuffers(gl, settings);
    }

    function refreshPerlin(gl, settings, buffers) {
        gl.deleteTexture(buffers.perlin);
        
        gl.deleteFramebuffer(buffers.perlinOutput.arr[0].fb);
        gl.deleteFramebuffer(buffers.perlinOutput.arr[1].fb);

        gl.deleteTexture(buffers.perlinOutput.arr[0].texture);
        gl.deleteTexture(buffers.perlinOutput.arr[1].texture);

        buffers.perlin = initPerlinBuffer(gl, settings.perlin.size);
        buffers.perlinOutput = initPerlinOutputTexture(gl, settings.perlin.width, settings.perlin.height);
    }

    function refreshDepthOutput(gl, settings, buffers) {
        gl.deleteFramebuffer(buffers.depthOutput.fb);
        gl.deleteTexture(buffers.depthOutput.texture);

        buffers.depthOutput = initDepthOutputTexture(gl, settings);
    }

    return {
        initBuffers: initBuffers,
        refreshBuffers: refreshBuffers,
        refreshPerlin: refreshPerlin,
        refreshDepthOutput: refreshDepthOutput
    };
})();