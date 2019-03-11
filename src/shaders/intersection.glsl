if (!window.ShaderSources) { window.ShaderSources = {}; }
window.ShaderSources.intersection = `

precision mediump float;

varying vec2 vVertexPosition;

uniform vec3 uUp;
uniform vec3 uRight;
uniform vec3 uForward;
uniform vec3 uOrigin;
uniform float uAspectRatio;
uniform float uFocalLength;

uniform sampler2D uHeightmap;
uniform mat3 uRotation;

uniform float uPlanetMinRadius;
uniform float uPlanetMaxRadius;
uniform float uPlanetAtmosphereRadius;
uniform vec3 uPlanetOrigin;

uniform int uHitAccuracy;
uniform float uRayMarchStride;
uniform bool uShadows;

uniform vec3 uLight;

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
    unit = uRotation * unit;

    return getSpherePointData(atan(unit.z, unit.x), asin(unit.y));
}

float getSphereHeight(vec3 unit) {
    return getSpherePointData(unit).w;
}

float getTrueHeight(float height) {
    return uPlanetMinRadius + (height * (uPlanetMaxRadius - uPlanetMinRadius));
}

SpherePoint getSpherePoint(vec3 unit) {
    vec4 data = getSpherePointData(unit);
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

vec4 getPlanetIntersection(Ray ray) {
    SphereIntersections outer = getSphereIntersections(ray, uPlanetOrigin, uPlanetMaxRadius);

    if (outer.intersected && outer.second >= 0.0) {
        SphereIntersections inner = getSphereIntersections(ray, uPlanetOrigin, uPlanetMinRadius);

        float start = outer.first;
        float end = outer.second;

        if (start < 0.0) {
            start = 0.0;
        }

        if (inner.intersected) {
            if (inner.first < 0.0 && inner.second > 0.0) {
                // inside planet
                return vec4(0.0, 0.0, 0.0, -1.0);
            } else if (inner.first > 0.0) {
                end = inner.first;
            }
        }

        vec3 startPoint = ray.origin + (ray.dir * start) - uPlanetOrigin;
        vec3 offset = ray.dir * (end - start);

        const float maxSteps = 1000.0;

        float stride = uRayMarchStride * (uPlanetMaxRadius * 2.0) / (end - start);

        for (float t = 0.0; t < maxSteps; t += 1.0) {
            if (t * stride > 1.0) {
                break;
            }
            vec3 point = startPoint + (offset * t * stride);

            float radius = sqrt(dot(point, point));
            vec3 unit = point / radius;
            
            float rayHeight = (radius - uPlanetMinRadius) / (uPlanetMaxRadius - uPlanetMinRadius);
            float height = getSphereHeight(unit);

            if (height >= rayHeight) {
                if (t < 0.5) {
                    return vec4(unit, start);
                }

                float lower = ((t - 1.0) * stride);
                float upper = (t * stride);
                float midpoint = (lower + upper) / 2.0;

                // perform binary search on exact hit location, with 4 iterations
                for (int i = 0; i < 20; i++) {
                    if (i >= uHitAccuracy) {
                        break;
                    }

                    point = startPoint + (offset * midpoint);
                    radius = sqrt(dot(point, point));
                    unit = point / radius;
                    rayHeight = (radius - uPlanetMinRadius) / (uPlanetMaxRadius - uPlanetMinRadius);
                    height = getSphereHeight(unit);

                    if (height >= rayHeight) {
                        upper = midpoint;
                    } else {
                        lower = midpoint;
                    }

                    midpoint = (lower + upper) / 2.0;
                }

                return vec4(unit, start + (midpoint * (end - start)));
            }
        }

        if (inner.intersected && inner.second >= 0.0) {
            return vec4(normalize(startPoint + offset - uPlanetOrigin), end);
        } else {
            return vec4(0.0, 0.0, 0.0, -1.0);
        }
    }

    return vec4(0.0, 0.0, 0.0, -1.0);
}

vec3 getPixel(vec2 pos) {
    return uOrigin + (uForward * uFocalLength) + (uRight * pos.x * 0.5) + (uUp * pos.y * 0.5 * (1.0 / uAspectRatio));
}

vec4 fireRay(Ray ray) {
    vec4 intersection = getPlanetIntersection(ray);

    if (intersection.w < 0.0) {
        intersection.xyz = ray.dir;
    } else {
        vec4 shadow = vec4(-1.0);
        if (uShadows) {
            SpherePoint spherePoint = getSpherePoint(intersection.xyz);
            vec3 point = uPlanetOrigin + (spherePoint.point * (spherePoint.height + 0.0001));

            shadow = getPlanetIntersection(Ray(point, uLight));
        }

        // point is shadowed
        if (shadow.w >= 0.0) {
            intersection.w = 2.0;
        } else {
            intersection.w = 1.0;
        }
    }

    return intersection;
}

void main() {
    vec3 pixel = getPixel(vVertexPosition);

    vec3 dir = normalize(pixel - uOrigin);
    vec4 intersection = fireRay(Ray(uOrigin, dir));

    gl_FragColor = intersection;
}

`;