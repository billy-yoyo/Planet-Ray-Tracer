if (!window.ShaderSources) { window.ShaderSources = {}; }
window.ShaderSources.perlin = `

precision mediump float;

varying vec2 vVertexPosition;

uniform sampler2D uPerlinGradients;
uniform float uPerlinSize;

uniform float uPersistence;
uniform float uLacunarity;
uniform float uBlurRadius;
uniform float uDifferential;
uniform float uExaggeration;
uniform int uOctaves;

const float PI = 3.1415926535897932384626433832795;
const float EPSILON = 0.000001;

vec3 getGradient(int vertex) {
    float y = floor(float(vertex) / uPerlinSize);
    float x = float(vertex) - (y * uPerlinSize);

    return texture2D(uPerlinGradients, vec2(x, y) / uPerlinSize).xyz;
}

float dotGradient(vec3 gridpos, vec3 pos, vec3 gridSize) {
    ivec3 igridSize = ivec3(int(gridSize.x), int(gridSize.y), int(gridSize.z)) + ivec3(1);
    ivec3 igridpos = ivec3(int(gridpos.x), int(gridpos.y), int(gridpos.z));

    int vertex = (igridpos.x * igridSize.y * igridSize.z) + (igridpos.y * igridSize.z) + igridpos.z;
    vec3 gradient = getGradient(vertex);
    vec3 diff = pos - gridpos;

    return dot(diff, gradient);
}

float lerp(float a0, float a1, float w) {
    return ((1.0 - w) * a0) + (w * a1);
}

float perlin2d(vec3 diff, vec3 gridpos, vec3 scaledPos, vec3 gridSize, float zoff) {
    float n0 = dotGradient(gridpos + vec3(0.0, 0.0, zoff), scaledPos, gridSize);
    float n1 = dotGradient(gridpos + vec3(1.0, 0.0, zoff), scaledPos, gridSize);

    float ix0 = lerp(n0, n1, diff.x);

    float n2 = dotGradient(gridpos + vec3(0.0, 1.0, zoff), scaledPos, gridSize);
    float n3 = dotGradient(gridpos + vec3(1.0, 1.0, zoff), scaledPos, gridSize);

    float ix1 = lerp(n2, n3, diff.x);

    return lerp(ix0, ix1, diff.y);
}

float perlin(vec3 gridSize, vec3 pos) {
    vec3 scaledPos = pos * gridSize;
    vec3 gridpos = floor(scaledPos);

    vec3 diff = scaledPos - gridpos;

    float iz0 = perlin2d(diff, gridpos, scaledPos, gridSize, 0.0);
    float iz1 = perlin2d(diff, gridpos, scaledPos, gridSize, 1.0);

    return (lerp(iz0, iz1, diff.z) + 1.0) / 2.0;
}

float stackedPerlin(float persistence, float lacunarity, vec3 pos) {
    vec3 freq = vec3(1.0);
    float amp = 1.0;

    float noise = 0.0;
    float total = 0.0;

    for (int i = 0; i < 20; i++) {
        if (i >= uOctaves) {
            break;
        }

        noise += amp * perlin(freq, pos);
        total += amp;

        amp *= persistence;
        freq *= lacunarity;
    }

    return noise / total;
}

void main() {
    float theta = vVertexPosition.x * PI;
    float phi = vVertexPosition.y * PI / 2.0;

    float radius = cos(phi);
    vec3 pos = vec3(radius * cos(theta), radius * sin(theta), sin(phi));

    float height = 0.0;
    float samples = 0.0;
    for (float x = -1.0; x <= 1.0 + EPSILON; x += 1.0) {
        for (float y = -1.0; y <= 1.0 + EPSILON; y += 1.0) {
            for (float z = -1.0; z <= 1.0 + EPSILON; z += 1.0) {
                height += stackedPerlin(uPersistence, uLacunarity, pos + (vec3(x, y, z) * uBlurRadius));
                samples += 1.0;
            }
        }
    }
    height /= samples;
    
    height -= 0.5;
    float heightSign = 1.0;
    if (heightSign < 0.0) {
        heightSign = -1.0;
    }

    height = ((1.0 - pow(1.0 - abs(height * 2.0), uDifferential)) / 2.0) + 0.5;

    height *= heightSign;

    height = pow(height, uExaggeration);
     
    gl_FragColor = vec4(vec3(0.0), height);
}
`;