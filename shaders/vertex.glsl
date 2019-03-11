if (!window.ShaderSources) { window.ShaderSources = {}; }
window.ShaderSources.vertex = `

attribute vec2 aVertexPosition;

varying vec2 vVertexPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 1.0, 1.0);
    vVertexPosition = aVertexPosition;
}
`;