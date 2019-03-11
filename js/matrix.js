

const ShaderMatrix = (function() {

    function multiplyMatrices(m0, m1) {
        var m = [];

        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var sum = 0;
                for (var i = 0; i < 3; i++) {
                    sum += m0[i + (y * 3)] * m1[x + (i * 3)];
                }
                m.push(sum);
            }
        }

        return m;
    }

    function multiplyVector(m, v) {
        return [
            (m[0] * v[0]) + (m[1] * v[1]) + (m[2] * v[2]),
            (m[3] * v[0]) + (m[4] * v[1]) + (m[5] * v[2]),
            (m[6] * v[0]) + (m[7] * v[1]) + (m[8] * v[2])
        ];
    }

    function determinant(m, crossX, crossY) {
        if (crossX !== undefined) {
            var xs = [], ys = [];

            for (var i = 0; i < 3; i++) {
                if (i != crossX) {
                    xs.push(i);
                }
                if (i != crossY) {
                    ys.push(i);
                }
            }

            return (m[xs[0] + (ys[0] * 3)] * m[xs[1] + (ys[1] * 3)]) - (m[xs[1] + (ys[0] * 3)] * m[xs[0] + (ys[1] * 3)]);
        } else {
            return ((m[0] * m[4] * m[8]) + (m[1] * m[5] * m[6]) + (m[2] * m[3] * m[7]))
                    - ((m[0] * m[5] * m[7]) + (m[1] * m[3] * m[8]) + (m[2] * m[4] * m[6]));
        }
    }

    function invertMatrix(m) {
        var invdet = 1.0 / determinant(m);

        return [
             determinant(m, 0, 0) * invdet, -determinant(m, 0, 1) * invdet,  determinant(m, 0, 2) * invdet,
            -determinant(m, 1, 0) * invdet,  determinant(m, 1, 1) * invdet, -determinant(m, 1, 2) * invdet,
             determinant(m, 2, 0) * invdet, -determinant(m, 2, 1) * invdet,  determinant(m, 2, 2) * invdet
        ];
    }

    function identityMatrix() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    function rotateAboutAxis(axis, angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle);

        var ncos = 1 - cos;

        return [
            cos + (axis[0] * axis[0] * ncos),             (axis[0] * axis[1] * ncos) - (axis[2] * sin), (axis[0] * axis[2] * ncos) + (axis[1] * sin),
            (axis[0] * axis[1] * ncos) + (axis[2] * sin), cos + (axis[1] * axis[1] * ncos),             (axis[1] * axis[2] * ncos) - (axis[0] * sin),
            (axis[0] * axis[2] * ncos) - (axis[1] * sin), (axis[1] * axis[2] * ncos) + (axis[0] * sin), cos + (axis[2] * axis[2] * ncos)
        ];
    }

    return {
        multiplyMatrices: multiplyMatrices,
        multiplyVector: multiplyVector,
        identityMatrix: identityMatrix,
        invertMatrix: invertMatrix,
        rotateAboutAxis: rotateAboutAxis,
        determinant: determinant
    };
})();