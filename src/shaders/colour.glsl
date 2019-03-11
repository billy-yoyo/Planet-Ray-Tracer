if (!window.ShaderSources) { window.ShaderSources = {}; }
window.ShaderSources.colour = `

precision mediump float;

varying vec2 vVertexPosition;

uniform sampler2D uDepthmap;
uniform sampler2D uHeightmap;

uniform vec3 uOrigin;
uniform mat3 uRotation;

uniform float uPlanetMinRadius;
uniform float uPlanetMaxRadius;
uniform float uPlanetAtmosphereRadius;
uniform vec3 uPlanetOrigin;

uniform vec3 uLight;

uniform float uMouseData;
uniform vec3 uMouseUnit;

uniform vec2 uCanvas;
uniform float uSupersampling;

const float PI = 3.1415926535897932384626433832795;
const float EPSILON = 0.000001;

struct Ray {
    vec3 origin;
    vec3 dir;
};

struct SphereIntersections {
    bool intersected;
    float first;
    float second;
};

struct SpherePoint {
    vec3 point;
    float height;
    vec3 color;
};

vec4 getSpherePointData(float theta, float phi) {
    // phi scales from -PI/2 to PI/2, we rescale this to 0 to 1.0
    phi = mod((1.0 + (phi * 2.0 / PI)) / 2.0, 2.0);

    // theta scales from -PI to PI, we rescale this to 0 to 1.0
    theta = mod((1.0 + (theta / PI)) / 2.0, 1.0);

    return texture2D(uHeightmap, vec2(theta, phi));
}

vec4 getSpherePointData(vec3 unit) {
    return getSpherePointData(atan(unit.z, unit.x), asin(unit.y));
}

float getSphereHeight(vec3 unit) {
    return getSpherePointData(unit).w;
}

float getSphereHeight(float theta, float phi) {
    return getSpherePointData(theta, phi).w;
}

float getTrueHeight(float height) {
    return uPlanetMinRadius + (height * (uPlanetMaxRadius - uPlanetMinRadius));
}

float getTrueHeight(vec3 unit) {
    return getTrueHeight(getSphereHeight(unit));
}

float getTrueHeight(float theta, float phi) {
    return getTrueHeight(getSphereHeight(theta, phi));
}

vec3 getUnit(float theta, float phi) {
    float radius = cos(phi);
    return vec3(radius * cos(theta), sin(phi), radius * sin(theta));
}

SpherePoint getSpherePoint(vec3 unit) {
    vec4 data = getSpherePointData(uRotation * unit);
    return SpherePoint(unit, getTrueHeight(data.w), data.xyz);
}

SphereIntersections getSphereIntersections(Ray ray, vec3 origin, float radius) {
    vec3 p = ray.origin - origin;

    float b = 2.0 * dot(p, ray.dir);
    float c = dot(p, p) - (radius * radius);

    float discriminant = (b * b) - (4.0 * c);

    if (discriminant >= 0.0) {
        float offset = sqrt(discriminant);

        float t0 = (-b - offset) / 2.0;
        float t1 = (-b + offset) / 2.0;

        return SphereIntersections(true, t0, t1);
    } else {
        return SphereIntersections(false, 0.0, 0.0);
    }
}

vec3 getPlanarNormal(vec3 normal, vec3 vector) {
    // result will be orthogonal to 'vector' and coplanar to (normal, vector)

    float s = dot(normal, vector);
    if (s <= 0.001) {
        return normal;
    }

    float mu = sqrt(1.0 / (1.0 - (s * s)));
    float lambda = - (mu * s);

    vec3 planarNormal = (lambda * vector) + (mu * normal);

    if (dot(planarNormal, normal) < 0.0) {
        planarNormal = -planarNormal;
    }

    return planarNormal;
}

vec3 getPlanetNormal(vec3 unit) {
    vec3 runit = uRotation * unit;
    
    float height = getTrueHeight(runit);
    vec3 midpoint = unit * height;
    
    float phiOffset = 0.001;
    float thetaOffset = phiOffset;

    const float steps = 1.0;

    vec3 normAvg = vec3(0.0);

    float theta = atan(unit.z, unit.x);
    float phi = asin(unit.y);

    float rtheta = atan(runit.z, runit.x);
    float rphi = asin(runit.y);

    for (float i = -steps; i <= steps + 0.01; i += 1.0) {
        for (float j = -steps; j <= steps + 0.01; j += 1.0) {
            if (abs(i) < EPSILON && abs(j) < EPSILON) {
                continue;
            }
            float curThetaOffset = (i * thetaOffset);
            float curPhiOffset = (j * phiOffset);

            vec3 curUnit = getUnit(theta + curThetaOffset, phi + curPhiOffset);
            float curHeight = getTrueHeight(rtheta + curThetaOffset, rphi + curPhiOffset);
            
            vec3 norm = getPlanarNormal(unit, normalize((curUnit * curHeight) - midpoint));

            normAvg += norm;
        }
    }

    return normalize(normAvg);
}

vec3 calculateColour(vec4 intersection) {
    if (intersection.w >= 0.0) {
        vec3 normal = getPlanetNormal(intersection.xyz);

        SpherePoint spherePoint = getSpherePoint(intersection.xyz);
        vec3 point = uPlanetOrigin + (spherePoint.point * (spherePoint.height + 0.0001));

        vec3 colour = spherePoint.color * 0.1;
        float coef = dot(normal, uLight);
        // float coef = pow(dot(normal, intersection.xyz), 30.0);

        if (coef > 0.0 && abs(intersection.w - 2.0) > EPSILON) {
            colour += spherePoint.color * coef * 0.9;
        }

        if (uMouseData > 0.0) {
            float dist = distance(intersection.xyz, uMouseUnit);
            if (dist < 0.1) {
                colour += vec3(0.3, 0.3, 0.3);
            }
        }

        return colour;
    } else {
        Ray ray = Ray(uOrigin, intersection.xyz);
        SphereIntersections atmosphere = getSphereIntersections(ray, uPlanetOrigin, uPlanetAtmosphereRadius);

        float ratio = 0.0;

        if (atmosphere.intersected && atmosphere.second >= 0.0) {
            float dist = atmosphere.second - max(0.0, atmosphere.first);

            ratio = dist / (uPlanetAtmosphereRadius * 2.0);
            ratio = ratio * ratio * ratio;
        }
            
        return vec3(0.0, 0.05, 0.1) + (vec3(0.3, 0.3, 0.3) * ratio);
    }
}

void main() {
    vec2 pos = (vVertexPosition + vec2(1.0)) / 2.0;

    float xstep = 1.0 / (uCanvas.x * uSupersampling);
    float ystep = 1.0 / (uCanvas.y * uSupersampling);

    vec3 colour = vec3(0.0);
    float samples = 0.0;

    for (float x = 0.0; x < 10.0; x += 1.0) {
        if (x > uSupersampling - EPSILON) {
            break;
        }
        
        for (float y = 0.0; y < 10.0; y += 1.0) {
            if (y > uSupersampling - EPSILON) {
                break;
            }

            vec4 intersection = texture2D(uDepthmap, pos + vec2(xstep * x, ystep * y));
            colour += calculateColour(intersection);
            samples += 1.0;
        }
    }
    

    gl_FragColor = vec4(colour / samples, 1.0);
}

`;