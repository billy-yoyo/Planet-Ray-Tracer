if (!window.ShaderSources) { window.ShaderSources = {}; }
window.ShaderSources.heightmap = `

precision mediump float;

varying vec2 vVertexPosition;

const float PI = 3.1415926535897932384626433832795;

uniform sampler2D uHeightmap;

uniform vec3 uMouseUnit;
uniform float uMouseData;

uniform float uMould;
uniform bool uSmooth;

uniform mat3 uRotation;
uniform mat3 uRotationInverse;

uniform float uWaterLevel;
uniform float uLastWaterLevel;

vec4 getSpherePointData(float theta, float phi) {
    // phi scales from -PI/2 to PI/2, we rescale this to 0 to 1.0
    phi = mod((1.0 + (phi * 2.0 / PI)) / 2.0, 2.0);

    // theta scales from -PI to PI, we rescale this to 0 to 1.0
    theta = mod((1.0 + (theta / PI)) / 2.0, 1.0);

    return texture2D(uHeightmap, vec2(theta, phi));
}

vec3 calculateUnit() {
    float theta = (vVertexPosition.x * PI);
    float phi = vVertexPosition.y * PI / 2.0;

    float radius = cos(phi);
    vec3 unit = vec3(radius * cos(theta), sin(phi), radius * sin(theta));

    return uRotationInverse * unit;
}

void main() {
    vec2 pos = (vVertexPosition + vec2(1.0)) / 2.0;

    vec4 rgba = texture2D(uHeightmap, pos);

    float height = rgba.a;
    
    if (height <= uLastWaterLevel && rgba.b > 0.0001) {
        height = rgba.b * uLastWaterLevel;
    }

    if (abs(uMould) > 0.0001 && uMouseData > 0.0) {
        vec3 unit = calculateUnit();

        float mouseDist = distance(uMouseUnit, unit);

        if (mouseDist < 0.1) {
            float coef = pow((0.1 - mouseDist) / 0.1, 2.0) * uMould;

            if (uSmooth) {
                vec3 rmouseunit = uRotation * uMouseUnit;
                float mouseTheta = atan(rmouseunit.z, rmouseunit.x);
                float mousePhi = asin(rmouseunit.y);

                float mouseHeight = getSpherePointData(mouseTheta, mousePhi).w;

                height = (mouseHeight * coef) + (height * (1.0 - coef));
            } else {
                height = min(1.0, max(0.0001, height + coef));
            }
        }
    }

    vec3 rgb = vec3(0.0, 0.0, 0.0);

    if (height <= uWaterLevel + 0.001) {
        rgb = vec3(0.0, 0.0, height / uWaterLevel);
        height = uWaterLevel;
    } else if (height < 0.425) {
        rgb = vec3(0.95, 0.94, 0.29);
    } else if (height < 0.47) {
        rgb = vec3(0.0, 1.0, 0.0); 
    } else if (height < 0.55) { 
        rgb = vec3(0.0, 0.7, 0.0);
    } else if (height < 0.65) {
        rgb = vec3(0.4, 0.4, 0.4);
    } else {
        rgb = vec3(1.0, 1.0, 1.0);
    }

    gl_FragColor = vec4(rgb, height);
}

`;