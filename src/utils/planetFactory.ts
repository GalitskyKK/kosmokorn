import {
  IcosahedronGeometry,
  Vector3,
  Color,
  BufferGeometry,
  BufferAttribute,
  MathUtils,
  CylinderGeometry,
  SphereGeometry,
  Object3D,
  Mesh,
  MeshPhongMaterial
} from "three"
// Geometry import removed as not needed
import { createNoise3D } from "simplex-noise"
import chroma from "chroma-js"

const { randFloat, randFloatSpread } = MathUtils
const { random, PI } = Math
const noise3D = createNoise3D()

export interface NoiseConfig {
  noiseF: number
  noiseD: number
  noiseWaterTreshold: number
  noiseWaterLevel: number
}

export interface TerrainMutation {
  type: "volcanic" | "meteor"
  center: { x: number; y: number; z: number } // направление на сфере (радиус = 1)
  radius: number // радианная «дальность» влияния (~0.15..0.5)
  strength: number // амплитуда смещения
}

export interface PlanetConfig {
  radius: number
  detail: number
  groundColor: string
  waterColor: string
  noiseConf: NoiseConfig
}

export interface PlanetPoint {
  x: number
  y: number
  z: number
}

// Используем Geometry из three/examples для face-based цветов

/**
 * Точная копия createGlobe из оригинального factory.js
 */
export function createGlobe(
  radius: number,
  detail: number,
  groundColor: string,
  waterColor: string,
  noiseConf: NoiseConfig,
  timeOffset?: number,
  mutations?: TerrainMutation[]
) {
  console.log("🚀 createGlobe called with parameters:")
  console.log(`📐 radius: ${radius}`)
  console.log(`🔍 detail: ${detail}`)
  console.log(`🟢 groundColor: ${groundColor}`)
  console.log(`🔵 waterColor: ${waterColor}`)
  console.log(`⚙️ noiseConf:`, noiseConf)

  const { noiseF, noiseD, noiseWaterTreshold, noiseWaterLevel } = noiseConf
  const time = timeOffset ?? 0 // если не передали, оставляем 0 для стабильности

  // noise buffer for faces colors
  const noises: number[] = []

  // noise function - точная копия из оригинала
  const vNoise = (v: Vector3, f: number, i?: number): number => {
    const nv = new Vector3(v.x, v.y, v.z).multiplyScalar(f).addScalar(time)
    let noise = (noise3D(nv.x, nv.y, nv.z) + 1) / 2
    noise = noise > noiseWaterTreshold ? noise : noiseWaterLevel
    if (Number.isInteger(i)) noises[i!] = noise
    return noise
  }

  // displacement function - точная копия из оригинала
  const dispV = (v: Vector3, i?: number): void => {
    const dv = new Vector3(v.x, v.y, v.z)
    dv.add(
      dv
        .clone()
        .normalize()
        .multiplyScalar(vNoise(dv, noiseF, i) * noiseD)
    )
    v.x = dv.x
    v.y = dv.y
    v.z = dv.z
  }

  // 1) Исходная индексированная геометрия
  const indexed = new IcosahedronGeometry(radius, detail)
  if (import.meta.env.DEV) {
    console.log(`🔺 IcosahedronGeometry created: ${indexed.attributes.position.count} vertices`)
  }

  // 2) Неиндексированная геометрия (3 вершины на грань)
  const geometry = indexed.toNonIndexed()
  const positions = geometry.getAttribute("position") as BufferAttribute
  const vertexCount = positions.count

  const colors = new Float32Array(vertexCount * 3)
  const groundCol = new Color(groundColor)
  const waterCol = new Color(waterColor)
  const lavaCol = new Color("#E25822")
  const ashCol = new Color("#4A4A4A")

  let groundFaces = 0
  let waterFaces = 0

  const tmp = new Vector3()
  const dir = new Vector3()
  const mutCenters = (mutations || []).map((m) =>
    new Vector3(m.center.x, m.center.y, m.center.z).normalize()
  )

  // Проходим по треугольникам и применяем смещение + раскраску
  for (let i = 0; i < vertexCount; i += 3) {
    const triRaw: number[] = []

    // 1) Считаем сырой шум ДО смещения и сохраняем
    for (let j = 0; j < 3; j++) {
      const vi = i + j
      tmp.set(positions.getX(vi), positions.getY(vi), positions.getZ(vi))
      const nv = tmp.clone().multiplyScalar(noiseF).addScalar(time)
      const raw = (noise3D(nv.x, nv.y, nv.z) + 1) / 2
      triRaw[j] = raw
    }

    // 2) Делаем displacement по ПОРОГОВОМУ шуму (как в оригинале)
    for (let j = 0; j < 3; j++) {
      const vi = i + j
      tmp.set(positions.getX(vi), positions.getY(vi), positions.getZ(vi))
      let n = triRaw[j]
      n = n > noiseWaterTreshold ? n : noiseWaterLevel
      const disp = tmp
        .clone()
        .normalize()
        .multiplyScalar(n * noiseD)
      tmp.add(disp)

      // 2.1) применяем мутации (вулканы/метеоры)
      if (mutCenters.length) {
        dir.copy(tmp).normalize()
        let extraOut = 0
        let extraIn = 0
        for (let k = 0; k < mutCenters.length; k++) {
          const m = mutations![k]
          const c = mutCenters[k]
          const angle = Math.acos(Math.min(1, Math.max(-1, dir.dot(c)))) // 0..pi
          const inf = Math.max(0, 1 - angle / Math.max(0.0001, m.radius)) // 0..1
          if (inf <= 0) continue
          if (m.type === "volcanic") extraOut += m.strength * inf
          else extraIn += m.strength * inf
        }
        if (extraOut !== 0 || extraIn !== 0) {
          tmp.addScaledVector(dir, extraOut - extraIn)
        }
      }

      positions.setXYZ(vi, tmp.x, tmp.y, tmp.z)
    }

    // 3) Классифицируем воду по raw <= threshold
    const isWater =
      triRaw[0] <= noiseWaterTreshold &&
      triRaw[1] <= noiseWaterTreshold &&
      triRaw[2] <= noiseWaterTreshold

    // 3.1) если мутации покрывают грань — перекрашиваем
    let overrideColor: Color | null = null
    if (mutCenters.length) {
      // Средний influence по вершинам
      let avgVolcano = 0
      let avgMeteor = 0
      for (let j = 0; j < 3; j++) {
        tmp.set(positions.getX(i + j), positions.getY(i + j), positions.getZ(i + j)).normalize()
        for (let k = 0; k < mutCenters.length; k++) {
          const m = mutations![k]
          const c = mutCenters[k]
          const angle = Math.acos(Math.min(1, Math.max(-1, tmp.dot(c))))
          const inf = Math.max(0, 1 - angle / Math.max(0.0001, m.radius))
          if (m.type === "volcanic") avgVolcano += inf / 3
          else avgMeteor += inf / 3
        }
      }
      if (avgVolcano > 0.35) overrideColor = lavaCol
      else if (avgMeteor > 0.35) overrideColor = ashCol
    }

    const c = overrideColor ? overrideColor : isWater ? waterCol : groundCol
    if (isWater) waterFaces++
    else groundFaces++

    for (let j = 0; j < 3; j++) {
      const vi = i + j
      colors[vi * 3] = c.r
      colors[vi * 3 + 1] = c.g
      colors[vi * 3 + 2] = c.b
    }
  }

  geometry.setAttribute("color", new BufferAttribute(colors, 3))
  geometry.computeVertexNormals()

  console.log("🌍 Planet generation stats:")
  console.log(`📐 Total faces: ${vertexCount / 3}`)
  console.log(`🟢 Ground faces: ${groundFaces} (${groundColor})`)
  console.log(`🔵 Water faces: ${waterFaces} (${waterColor})`)
  console.log(`📊 Water percentage: ${Math.round((waterFaces / (vertexCount / 3)) * 100)}%`)

  const bufferGeometry = geometry

  return {
    geometry: bufferGeometry,
    vNoise,
    dispV
  }
}

/**
 * Рандомизация BufferGeometry как в оригинале little-planet
 */
function rdnGeo(bgeo: BufferGeometry, d: number): BufferGeometry {
  const g = bgeo.toNonIndexed()
  const p = g.getAttribute("position") as BufferAttribute
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(
      i,
      p.getX(i) + randFloatSpread(2 * d),
      p.getY(i) + randFloatSpread(2 * d),
      p.getZ(i) + randFloatSpread(2 * d)
    )
  }
  g.computeVertexNormals()
  return g
}

/**
 * Точная копия createTree из оригинального factory.js
 */
export function createTree(tsize: number, bsize: number, tcolor: string, bcolor: string): Object3D {
  const tradius = tsize * 0.1
  const t1size = tsize / 2
  const t1radius = tradius * 0.7

  const tmaterial = new MeshPhongMaterial({ color: tcolor, flatShading: true, shininess: 30 })
  const bmaterial = new MeshPhongMaterial({
    color: bcolor,
    flatShading: true,
    shininess: 0,
    transparent: true,
    opacity: 0.9
  })

  const tree = new Object3D()

  // trunk - точная копия из оригинала
  let tgeometry: BufferGeometry = new CylinderGeometry(tradius * 0.7, tradius, tsize, 5, 3, true)
  tgeometry.translate(0, tsize / 2, 0)
  tgeometry.rotateX(-PI / 2)
  tgeometry = rdnGeo(tgeometry, tradius * 0.2)

  // body - точная копия из оригинала
  let bgeometry: BufferGeometry = new SphereGeometry(bsize, 4, 4)
  bgeometry.translate(0, tsize + bsize * 0.7, 0)
  bgeometry.rotateX(-PI / 2)
  bgeometry = rdnGeo(bgeometry, bsize * 0.2)

  if (random() > 0.5) {
    // trunk 1 - точная копия из оригинала
    let t1geometry: BufferGeometry = new CylinderGeometry(
      t1radius * 0.5,
      t1radius,
      t1size,
      4,
      2,
      true
    )
    t1geometry.translate(0, t1size / 2, 0)
    t1geometry.rotateZ(PI / 3 + randFloat(0, 0.2))
    t1geometry.rotateY(randFloatSpread(PI / 2))
    t1geometry.translate(0, tsize * randFloat(0.2, 0.7), 0)
    t1geometry.rotateX(-PI / 2)
    t1geometry = rdnGeo(t1geometry, tradius * 0.1)

    // Объединяем геометрии ствола (упрощенно)
    // В оригинале используется BufferGeometryUtils.mergeBufferGeometries
    // Для простоты создаем отдельный mesh
    const t1mesh = new Mesh(t1geometry, tmaterial)
    t1mesh.castShadow = true
    tree.add(t1mesh)

    // body 1 - точная копия из оригинала
    const b1size = bsize * randFloat(0.5, 0.8)
    let b1geometry: BufferGeometry = new SphereGeometry(b1size, 4, 4)
    // Упрощенная позиция вместо getTrunkBodyPosition
    b1geometry.translate(0, tsize + b1size * 0.8, 0)
    b1geometry = rdnGeo(b1geometry, b1size * 0.2)

    const b1mesh = new Mesh(b1geometry, bmaterial)
    b1mesh.castShadow = true
    tree.add(b1mesh)
  }

  if (random() > 0.5) {
    // trunk 2 - точная копия из оригинала
    let t2geometry: BufferGeometry = new CylinderGeometry(
      t1radius * 0.5,
      t1radius,
      t1size,
      4,
      2,
      true
    )
    t2geometry.translate(0, t1size / 2, 0)
    t2geometry.rotateZ(-PI / 3 + randFloat(0, 0.2))
    t2geometry.rotateY(randFloatSpread(PI / 2))
    t2geometry.translate(0, tsize * randFloat(0.2, 0.7), 0)
    t2geometry.rotateX(-PI / 2)
    t2geometry = rdnGeo(t2geometry, tradius * 0.1)

    const t2mesh = new Mesh(t2geometry, tmaterial)
    t2mesh.castShadow = true
    tree.add(t2mesh)

    // body 2 - точная копия из оригинала
    const b2size = bsize * randFloat(0.5, 0.8)
    let b2geometry: BufferGeometry = new SphereGeometry(b2size, 4, 4)
    b2geometry.translate(0, tsize + b2size * 0.8, 0)
    b2geometry = rdnGeo(b2geometry, b2size * 0.2)

    const b2mesh = new Mesh(b2geometry, bmaterial)
    b2mesh.castShadow = true
    tree.add(b2mesh)
  }

  // Основные элементы
  const tmesh = new Mesh(tgeometry, tmaterial)
  tmesh.castShadow = true
  tree.add(tmesh)

  const bmesh = new Mesh(bgeometry, bmaterial)
  bmesh.castShadow = true
  tree.add(bmesh)

  return tree
}

/**
 * Точная копия createRock из оригинального factory.js
 */
export function createRock(size: number, color: string): Mesh {
  const material = new MeshPhongMaterial({ color, flatShading: true })
  let geometry: BufferGeometry = new SphereGeometry(size, 4, 3)
  geometry = rdnGeo(geometry, size * 0.2)
  const rock = new Mesh(geometry, material)
  rock.castShadow = true
  return rock
}

/**
 * Точная копия getFibonacciSpherePoints из оригинала
 */
export function getFibonacciSpherePoints(
  samples: number,
  radius: number,
  randomize = true
): PlanetPoint[] {
  const random_val = randomize ? Math.random() * samples : 1
  const points: PlanetPoint[] = []
  const offset = 2 / samples
  const increment = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < samples; i++) {
    let y = i * offset - 1 + offset / 2
    const distance = Math.sqrt(1 - Math.pow(y, 2))
    const phi = ((i + random_val) % samples) * increment
    let x = Math.cos(phi) * distance
    let z = Math.sin(phi) * distance
    x = x * radius
    y = y * radius
    z = z * radius
    points.push({ x, y, z })
  }
  return points
}

/**
 * Генерация цветовой шкалы для деревьев
 */
export function createTreeColorScale(colors: string[]) {
  return chroma.scale(colors)
}
