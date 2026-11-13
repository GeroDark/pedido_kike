/**
 * El cartel no es una imagen: es una función. Cada punto calcula la luminancia
 * del rostro en su posición y la convierte en radio, así los ojos pueden
 * moverse y parpadear sin texturas.
 */

export const vertexShader = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform vec3 uFace;      // cx, cy, px por unidad
uniform vec2 uGaze;      // desplazamiento del iris en unidades de rostro
uniform float uBlink;    // 0 abierto, 1 cerrado
uniform float uMorph;    // 0 cartel, 1 ciudad
uniform float uTime;
uniform float uPitch;
uniform float uDpr;
uniform float uAlpha;

attribute vec3 aCity;    // x, y, tamaño de ventana
attribute vec3 aMisc;    // retardo, semilla, es-tu-ventana

varying float vAlpha;
varying float vYou;
varying float vSize;

float faceLum(vec2 f) {
  float sgn = f.x < 0.0 ? -1.0 : 1.0;
  vec2 q = vec2(abs(f.x) - 0.47, f.y);

  // Carne iluminada desde arriba a la izquierda.
  float lum = 0.2;
  lum += 0.2 * smoothstep(1.5, 0.1, length((f - vec2(-0.12, 0.66)) * vec2(0.6, 1.25)));
  lum += 0.12 * smoothstep(0.8, 0.1, length((vec2(abs(f.x), f.y) - vec2(0.64, -0.44)) * vec2(1.0, 1.5)));
  lum -= 0.035 * sgn;

  // Puente y sombras de la nariz.
  float bridge = smoothstep(0.1, 0.02, abs(f.x + 0.012)) * smoothstep(0.26, 0.0, f.y) * smoothstep(-1.3, -0.45, f.y);
  lum += 0.17 * bridge;
  float nsx = abs(f.x) - (0.13 + 0.11 * smoothstep(0.0, -0.8, f.y));
  lum -= 0.12 * smoothstep(0.07, 0.0, abs(nsx)) * smoothstep(0.12, -0.1, f.y);

  // Ceño: dos surcos entre las cejas.
  float furrow = smoothstep(0.024, 0.0, abs(abs(f.x) - 0.056)) * smoothstep(0.1, 0.2, f.y) * smoothstep(0.42, 0.3, f.y);
  lum -= 0.16 * furrow;

  // Cuenca del ojo.
  lum -= 0.17 * smoothstep(0.56, 0.1, length(vec2(q.x, (q.y - 0.05) * 1.7)));

  float xx = q.x / 0.31;
  float arch = max(0.0, 1.0 - xx * xx);
  float inX = step(abs(xx), 1.0);

  // Bolsa bajo el ojo.
  float bagY = -0.175 * arch - 0.02;
  lum -= 0.09 * smoothstep(0.03, 0.0, abs(q.y - bagY)) * inX;

  // Ceja: gruesa junto a la nariz, baja hacia el centro. Severa.
  float bx = clamp(q.x, -0.37, 0.47);
  float by = 0.262 + 0.17 * bx - 0.5 * bx * bx;
  float bth = mix(0.09, 0.022, smoothstep(-0.37, 0.47, bx));
  float bd = length(vec2(q.x - bx, q.y - by)) - bth;
  lum = mix(lum, 0.0, smoothstep(0.02, -0.015, bd));

  // Párpados.
  float open = 1.0 - uBlink;
  float yl = -0.085 * arch;
  float yuOpen = 0.125 * arch;
  float yu = mix(yl, yuOpen, open);
  float inside = inX * smoothstep(-0.004, 0.012, yu - q.y) * smoothstep(-0.004, 0.012, q.y - yl);

  float lidShade = smoothstep(0.075, 0.0, yu - q.y);
  float eyeL = 0.98 - 0.4 * lidShade - 0.14 * smoothstep(0.5, 1.0, abs(xx));

  vec2 ic = vec2(f.x - sgn * 0.47, f.y - 0.012) - uGaze;
  float id = length(ic);
  float iris = mix(0.36, 0.08, smoothstep(0.055, 0.108, id)) * (1.0 - 0.5 * lidShade);
  eyeL = mix(eyeL, iris, smoothstep(0.116, 0.1, id));
  eyeL = mix(eyeL, 0.0, smoothstep(0.056, 0.044, id));
  eyeL = mix(eyeL, 1.0, smoothstep(0.024, 0.012, length(ic - vec2(-0.036, 0.038))));
  lum = mix(lum, eyeL, inside);

  // Línea de pestañas, párpado inferior y pliegue.
  float lash = inX * smoothstep(0.024, 0.004, abs(q.y - yu - 0.008));
  lum = mix(lum, 0.0, lash);
  float low = inX * smoothstep(0.012, 0.002, abs(q.y - yl + 0.004));
  lum = mix(lum, 0.08, low * 0.6 * open);
  float crease = inX * smoothstep(0.013, 0.0, abs(q.y - (yuOpen + 0.046)));
  lum -= 0.1 * crease * arch;

  return clamp(lum, 0.0, 1.0);
}

void main() {
  vec2 p0 = position.xy;
  float seed = aMisc.y;

  float e = clamp((uMorph - aMisc.x) / 0.48, 0.0, 1.0);
  e = e * e * (3.0 - 2.0 * e);

  vec2 f = vec2(p0.x - uFace.x, uFace.y - p0.y) / uFace.z;
  float lum = faceLum(f);

  // El cartel se hunde en negro por abajo, donde va el titular.
  float ny = p0.y / uRes.y;
  lum *= smoothstep(0.8, 0.47, ny);
  lum *= smoothstep(0.05, 0.2, ny);
  lum *= 1.0 - 0.45 * smoothstep(0.75, 1.5, length(f * vec2(0.72, 1.0)));
  // Fósforo vivo: un temblor casi imperceptible.
  lum *= 0.965 + 0.035 * sin(uTime * 1.9 + seed * 60.0);

  float rPoster = sqrt(clamp(lum, 0.0, 1.0));
  float twinkle = 0.86 + 0.14 * sin(uTime * (0.5 + seed) + seed * 90.0);
  float rCity = aCity.z * twinkle;

  float mid = sin(3.14159265 * e);
  float r = mix(rPoster, rCity, e) * (1.0 - 0.3 * mid);

  vec2 pos = mix(p0, aCity.xy, e);
  float a = seed * 6.2831853;
  pos += mid * vec2(cos(a + uTime * 0.45), sin(a * 1.3 + uTime * 0.55)) * uPitch * (2.5 + 5.5 * seed);

  vYou = aMisc.z * e;
  float d = 2.0 * r * uPitch * 0.62 * uDpr;
  d *= 1.0 + vYou * (1.5 + 0.35 * sin(uTime * 2.2));

  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  if (d < 0.7 || uAlpha < 0.004) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = d;
  vSize = d;
  vAlpha = uAlpha * mix(1.0, 0.82, e);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uPaper;
uniform vec3 uPhosphor;
uniform float uDpr;

varying float vAlpha;
varying float vYou;
varying float vSize;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float aa = 1.0 / max(vSize, 1.0);
  float a = 1.0 - smoothstep(0.5 - aa, 0.5, d);
  // Líneas de barrido del tubo.
  float scan = 0.8 + 0.2 * step(0.5, fract(gl_FragCoord.y / (3.0 * uDpr)));
  float you = clamp(vYou, 0.0, 1.0);
  vec3 col = mix(uPaper, uPhosphor, you);
  gl_FragColor = vec4(col, a * vAlpha * mix(scan, 1.0, you));
}
`;
