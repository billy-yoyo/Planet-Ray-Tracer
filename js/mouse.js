

const ShaderMouse = (function() {
    function readPos(gl, buffers, x, y) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.depthOutput.fb);
        const data = new Float32Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, data);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return data;
    }
    
    function readMousePos(gl, buffers, settings, mouse) {
        var rect = gl.canvas.getBoundingClientRect();
        var pos = readPos(gl, buffers, (mouse.x - rect.left) * settings.render.supersampling, (rect.bottom - mouse.y) * settings.render.supersampling);
        return {
            unit: new Float32Array([pos[0], pos[1], pos[2]]),
            data: pos[3]
        };
    }

    function createMouseTracker() {
        var tracker = {x: 0, y: 0, buttons: 0, start: null};

        function onMouseUpdate(e) {
            tracker.x = e.clientX;
            tracker.y = e.clientY;
            tracker.buttons = e.buttons;
        }

        function onMouseDown(e) {
            onMouseUpdate(e);
            tracker.start = {x: tracker.x, y: tracker.y, buttons: tracker.buttons};
        }

        function onMouseUp(e) {
            onMouseUpdate(e);
            tracker.start = null;
        }

        document.addEventListener('mousemove', onMouseUpdate, false);
        document.addEventListener('mouseenter', onMouseUpdate, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);

        return tracker;
    }

    function initWheelListener(gl, settings) {
        gl.canvas.addEventListener('wheel', function(e) {
            var delta = e.deltaY;
            if (delta > 0.0) {
                delta = 1.0;
            } else {
                delta = -1.0;
            }
            console.log(e);
            settings.view.focalLength = Math.max(0.1, Math.min(1.0, settings.view.focalLength + (delta / 40.0)));
            settings.render.refreshDepth = true;
        });
    }

    function initResizeListener(gl, settings, buffers) {
        window.addEventListener('resize', function(e) {
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;

            ShaderSettings.updateCanvasData(gl, settings);
            ShaderBuffers.refreshDepthOutput(gl, settings, buffers);
            settings.render.refreshDepth = true;
        });
    }

    function initMouseHandler(gl, settings, buffers) {
        var mouse = createMouseTracker();

        initWheelListener(gl, settings);
        initResizeListener(gl, settings, buffers);

        function update() {
            settings.mousePos = readMousePos(gl, buffers, settings, mouse);

            if (mouse.buttons & 4 && mouse.start && mouse.start.buttons & 4) {
                if (!mouse.start.init) {
                    mouse.start.init = settings.view.rotation;
                }

                var dx = mouse.x - mouse.start.x;
                var dy = mouse.start.y - mouse.y;

                var length = Math.sqrt((dx * dx) + (dy * dy));

                if (length > 0.001) {
                    var orthdx = dy / length;
                    var orthdy = -dx / length;

                    var axis = [
                       (orthdx * settings.view.right[0]) + (orthdy * settings.view.up[0]),
                       (orthdx * settings.view.right[1]) + (orthdy * settings.view.up[1]),
                       (orthdx * settings.view.right[2]) + (orthdy * settings.view.up[2]),
                    ];

                    var angle = 0.005 * length;

                    var rotation = ShaderMatrix.rotateAboutAxis(axis, angle);

                    settings.view.rotation = ShaderMatrix.multiplyMatrices(rotation, mouse.start.init);
                    settings.view.rotationInverse = ShaderMatrix.invertMatrix(settings.view.rotation);
                    settings.render.refreshDepth = true;
                }
            }

            if (mouse.buttons & 1 || mouse.buttons & 2) {
                if (mouse.buttons & 1 && mouse.buttons & 2) {
                    settings.smooth = true;
                    settings.mould = 1.0;
                } else if (mouse.buttons & 1) {
                    settings.mould = 0.2;
                } else {
                    settings.mould = -0.2;
                }
                
                settings.mould *= settings.elapsed;

                settings.render.refreshDepth = true;
                settings.render.refreshHeightmap = true;
            }
        }
        
        return {
            update: update
        };
    }

    return {
        initMouseHandler: initMouseHandler
    };
})();