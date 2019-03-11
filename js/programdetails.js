
const ShaderProgramDetails = (function() {

    function initIntersectionProgram(gl) {
        const vertexShaderSource = ShaderSources.vertex;
        const fragmentShaderSource = ShaderSources.intersection;

        const shaderProgram = ShaderProgram.initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                up: gl.getUniformLocation(shaderProgram, 'uUp'),
                right: gl.getUniformLocation(shaderProgram, 'uRight'),
                forward: gl.getUniformLocation(shaderProgram, 'uForward'),
                origin: gl.getUniformLocation(shaderProgram, 'uOrigin'),
                aspectRatio: gl.getUniformLocation(shaderProgram, 'uAspectRatio'),
                focalLength: gl.getUniformLocation(shaderProgram, 'uFocalLength'),
                heightmap: gl.getUniformLocation(shaderProgram, 'uHeightmap'),
                rotation: gl.getUniformLocation(shaderProgram, 'uRotation'),
                light: gl.getUniformLocation(shaderProgram, 'uLight'),
                planetMinRadius: gl.getUniformLocation(shaderProgram, 'uPlanetMinRadius'),
                planetMaxRadius: gl.getUniformLocation(shaderProgram, 'uPlanetMaxRadius'),
                planetAtmosphereRadius: gl.getUniformLocation(shaderProgram, 'uPlanetAtmosphereRadius'),
                planetOrigin: gl.getUniformLocation(shaderProgram, 'uPlanetOrigin'),
                hitAccuracy: gl.getUniformLocation(shaderProgram, 'uHitAccuracy'),
                rayMarchStride: gl.getUniformLocation(shaderProgram, 'uRayMarchStride'),
                shadows: gl.getUniformLocation(shaderProgram, 'uShadows'),
            }
        };

        return programInfo;
    }

    function initHeightmapProgram(gl) {
        const vertexShaderSource = ShaderSources.vertex;
        const fragmentShaderSource = ShaderSources.heightmap;

        const shaderProgram = ShaderProgram.initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
            },
            uniformLocations: {
                heightmap: gl.getUniformLocation(shaderProgram, 'uHeightmap'),
                depthmap: gl.getUniformLocation(shaderProgram, 'uDepthmap'),
                mouseUnit: gl.getUniformLocation(shaderProgram, 'uMouseUnit'),
                mouseData: gl.getUniformLocation(shaderProgram, 'uMouseData'),
                mould: gl.getUniformLocation(shaderProgram, 'uMould'),
                smooth: gl.getUniformLocation(shaderProgram, 'uSmooth'),
                rotation: gl.getUniformLocation(shaderProgram, 'uRotation'),
                rotationInverse: gl.getUniformLocation(shaderProgram, 'uRotationInverse'),
                waterLevel: gl.getUniformLocation(shaderProgram, 'uWaterLevel'),
                lastWaterLevel: gl.getUniformLocation(shaderProgram, 'uLastWaterLevel'),
            }
        };

        return programInfo;
    }

    function initColourProgram(gl) {
        const vertexShaderSource = ShaderSources.vertex;
        const fragmentShaderSource = ShaderSources.colour;

        const shaderProgram = ShaderProgram.initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
            },
            uniformLocations: {
                depthmap: gl.getUniformLocation(shaderProgram, 'uDepthmap'),
                heightmap: gl.getUniformLocation(shaderProgram, 'uHeightmap'),
                origin: gl.getUniformLocation(shaderProgram, 'uOrigin'),
                light: gl.getUniformLocation(shaderProgram, 'uLight'),
                planetMinRadius: gl.getUniformLocation(shaderProgram, 'uPlanetMinRadius'),
                planetMaxRadius: gl.getUniformLocation(shaderProgram, 'uPlanetMaxRadius'),
                planetAtmosphereRadius: gl.getUniformLocation(shaderProgram, 'uPlanetAtmosphereRadius'),
                planetOrigin: gl.getUniformLocation(shaderProgram, 'uPlanetOrigin'),
                rotation: gl.getUniformLocation(shaderProgram, 'uRotation'),
                mouseUnit: gl.getUniformLocation(shaderProgram, 'uMouseUnit'),
                mouseData: gl.getUniformLocation(shaderProgram, 'uMouseData'),
                canvas: gl.getUniformLocation(shaderProgram, 'uCanvas'),
                supersampling: gl.getUniformLocation(shaderProgram, 'uSupersampling'),
            }
        };

        return programInfo;
    }

    function initPerlinProgram(gl) {
        const vertexShaderSource = ShaderSources.vertex;
        const fragmentShaderSource = ShaderSources.perlin;

        const shaderProgram = ShaderProgram.initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                perlinGradients: gl.getUniformLocation(shaderProgram, 'uPerlinGradients'),
                perlinSize: gl.getUniformLocation(shaderProgram, 'uPerlinSize'),
                persistence: gl.getUniformLocation(shaderProgram, 'uPersistence'),
                lacunarity: gl.getUniformLocation(shaderProgram, 'uLacunarity'),
                blurRadius: gl.getUniformLocation(shaderProgram, 'uBlurRadius'),
                differential: gl.getUniformLocation(shaderProgram, 'uDifferential'),
                exaggeration: gl.getUniformLocation(shaderProgram, 'uExaggeration'),
                octaves: gl.getUniformLocation(shaderProgram, 'uOctaves'),
            }
        };

        return programInfo;
    }

    function initProgramDetails(gl) {
        return {
            perlin: initPerlinProgram(gl),
            intersection: initIntersectionProgram(gl),
            colour: initColourProgram(gl),
            heightmap: initHeightmapProgram(gl)
        };
    }

    return {
        initProgramDetails: initProgramDetails
    };
})();