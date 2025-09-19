import React, { useRef, useMemo, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import { Group, Vector3, MathUtils, Object3D } from "three"
import { motion } from "framer-motion"
import seedrandom from "seedrandom"

import {
  createGlobe,
  createTree,
  createRock,
  getFibonacciSpherePoints,
  createTreeColorScale,
  type NoiseConfig,
  type TerrainMutation
} from "../../utils/planetFactory"
import Loading from "../ui/Loading"
import { IPlanetEvent, EventType } from "../../types"

const { randFloat } = MathUtils

interface ISimpleLittlePlanetProps {
  isAnimating?: boolean
  showControls?: boolean
  autoRotate?: boolean
  isMobile?: boolean // Для оптимизации DPR
  // Детерминированность
  userSeed?: string
  day?: number
  events?: IPlanetEvent[]
  biomeIndex?: number
  // Стадия развития планеты
  stage?: string
  // Базовые параметры (могут быть переопределены)
  radius?: number
  detail?: number
  groundColor?: string
  waterColor?: string
  noiseConf?: NoiseConfig
  maxTrees?: number
  maxRocks?: number
  treeSize?: number
  rockSize?: number
  treeTrunkColor?: string
  treeBodyColor1?: string
  treeBodyColor2?: string
  treeBodyColor3?: string
  treeBodyColor4?: string
  treeBodyColor5?: string
  rockColor?: string
}

interface TreeData {
  tSize: number
  bSize: number
  tColor: string
  bColor: string
  position: Vector3
}

interface RockData {
  size: number
  color: string
  position: Vector3
}

// Тип для базовых пропсов, передаваемых в сцену
type IBasePlanetProps = Required<Omit<ISimpleLittlePlanetProps, "userSeed" | "day" | "events">>

// Биомы для разнообразия планет (детерминированный выбор по seed)
interface BiomePreset {
  name: string
  groundColor: string
  waterColor: string
  treePalette: [string, string, string, string, string]
  rockColor: string
  noiseFMultiplier: number
  noiseDMultiplier: number
  waterThresholdDelta: number // добавляется к noiseWaterTreshold
  maxTreesMultiplier: number
  maxRocksMultiplier: number
}

const BIOMES: BiomePreset[] = [
  {
    name: "forest",
    groundColor: "#417B2B",
    waterColor: "#2080D0",
    treePalette: ["#509A36", "#3C8A2C", "#6BBE53", "#4CAF2F", "#3E9F2A"],
    rockColor: "#808080",
    noiseFMultiplier: 1.0,
    noiseDMultiplier: 1.0,
    waterThresholdDelta: 0.0,
    maxTreesMultiplier: 1.0,
    maxRocksMultiplier: 1.0
  },
  {
    name: "desert",
    groundColor: "#C2B280",
    waterColor: "#1D74C9",
    treePalette: ["#C6B36D", "#D1BF79", "#B9A764", "#CAB56F", "#B29E5D"],
    rockColor: "#9B8B6E",
    noiseFMultiplier: 0.9,
    noiseDMultiplier: 0.7,
    waterThresholdDelta: -0.2, // меньше воды
    maxTreesMultiplier: 0.25,
    maxRocksMultiplier: 1.2
  },
  {
    name: "ice",
    groundColor: "#A7E8FF",
    waterColor: "#5BC0FF",
    treePalette: ["#7AD3FF", "#99DEFF", "#B5E6FF", "#8FD8FF", "#66CCFF"],
    rockColor: "#B0C4DE",
    noiseFMultiplier: 0.8,
    noiseDMultiplier: 0.9,
    waterThresholdDelta: +0.15, // больше воды/льда
    maxTreesMultiplier: 0.2,
    maxRocksMultiplier: 0.8
  },
  {
    name: "oceanic",
    groundColor: "#1F6AA5",
    waterColor: "#1B6BB8",
    treePalette: ["#3AA7A1", "#2A908B", "#5CC1BA", "#2F9E98", "#46B7B0"],
    rockColor: "#6F8FA6",
    noiseFMultiplier: 1.1,
    noiseDMultiplier: 0.8,
    waterThresholdDelta: +0.25,
    maxTreesMultiplier: 0.35,
    maxRocksMultiplier: 0.6
  },
  {
    name: "volcanic",
    groundColor: "#5A2D27",
    waterColor: "#3A3A3A",
    treePalette: ["#E25822", "#FF7F50", "#D94C1A", "#F27A3A", "#F2A679"],
    rockColor: "#4A4A4A",
    noiseFMultiplier: 1.2,
    noiseDMultiplier: 1.4,
    waterThresholdDelta: -0.3,
    maxTreesMultiplier: 0.1,
    maxRocksMultiplier: 1.6
  },
  {
    name: "alien",
    groundColor: "#6C5B7B",
    waterColor: "#355C7D",
    treePalette: ["#C06C84", "#F67280", "#99B898", "#C06C84", "#F8B195"],
    rockColor: "#7E6A8E",
    noiseFMultiplier: 1.05,
    noiseDMultiplier: 1.1,
    waterThresholdDelta: 0.05,
    maxTreesMultiplier: 0.8,
    maxRocksMultiplier: 1.2
  }
]

/**
 * PlanetGroup компонент
 */
const PlanetGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<Group>(null!)
  return <group ref={groupRef}>{children}</group>
}

/**
 * Globe компонент - точная копия Globe.js
 */
const Globe: React.FC<{
  radius: number
  detail: number
  groundColor: string
  waterColor: string
  noiseConf: NoiseConfig
  timeOffset: number
  mutations?: TerrainMutation[]
  onGlobeReady: (vNoise: (v: Vector3, f: number) => number, dispV: (v: Vector3) => void) => void
}> = ({
  radius,
  detail,
  groundColor,
  waterColor,
  noiseConf,
  timeOffset,
  mutations,
  onGlobeReady
}) => {
  const { geometry, vNoise, dispV } = useMemo(() => {
    const result = createGlobe(
      radius,
      detail,
      groundColor,
      waterColor,
      noiseConf,
      timeOffset,
      mutations
    )
    return result
  }, [radius, detail, groundColor, waterColor, noiseConf, timeOffset, mutations])

  useEffect(() => {
    onGlobeReady(vNoise, dispV)
  }, [vNoise, dispV, onGlobeReady])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhongMaterial
        vertexColors={true}
        flatShading={true}
        shininess={30}
        transparent={false}
        opacity={1}
      />
    </mesh>
  )
}

/**
 * Tree компонент
 */
const Tree: React.FC<TreeData & { lookAt: Vector3 }> = ({
  tSize,
  bSize,
  tColor,
  bColor,
  position,
  lookAt
}) => {
  const treeRef = useRef<Object3D>(null!)

  const treeObject = useMemo(() => {
    return createTree(tSize, bSize, tColor, bColor)
  }, [tSize, bSize, tColor, bColor])

  useFrame(() => {
    if (treeRef.current) {
      treeRef.current.lookAt(lookAt)
    }
  })

  return (
    <primitive
      ref={treeRef}
      object={treeObject}
      position={[position.x, position.y, position.z]}
      castShadow={true}
      receiveShadow={true}
    />
  )
}

/**
 * Rock компонент
 */
const Rock: React.FC<RockData> = ({ size, color, position }) => {
  const rockObject = useMemo(() => {
    return createRock(size, color)
  }, [size, color])

  return (
    <primitive
      object={rockObject}
      position={[position.x, position.y, position.z]}
      castShadow={true}
      receiveShadow={true}
    />
  )
}

/**
 * Основная сцена планеты - детерминированно по seed/day с биомами
 */
const LittlePlanetScene: React.FC<
  Required<Pick<ISimpleLittlePlanetProps, "userSeed" | "day" | "stage">> & {
    base: IBasePlanetProps
    events?: IPlanetEvent[]
  }
> = ({ userSeed, day, base, events, stage }) => {
  const groupRef = useRef<Group>(null!)

  // Генераторы: биом по seed, внутренняя вариация и день
  const worldRng = useMemo(() => seedrandom(`${userSeed}-world`), [userSeed])
  const rng = useMemo(() => seedrandom(`${userSeed}-${day}`), [userSeed, day])

  // Конвертация событий -> мутации рельефа
  const mutations: TerrainMutation[] = useMemo(() => {
    if (!events || !events.length) return []
    const applicable = events.filter((e) => e.day <= day)
    const muts: TerrainMutation[] = []
    for (const e of applicable) {
      const erng = seedrandom(`${userSeed}-event-${e.id}`)
      // случайное направление на сфере
      const theta = Math.acos(1 - 2 * erng()) // 0..pi
      const phi = 2 * Math.PI * erng()
      const center = {
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.cos(theta),
        z: Math.sin(theta) * Math.sin(phi)
      }
      if (e.type === EventType.VOLCANIC) {
        muts.push({
          type: "volcanic",
          center,
          radius: 0.22 + erng() * 0.25,
          strength: 2 + erng() * 4
        })
      }
      if (e.type === EventType.METEOR) {
        muts.push({
          type: "meteor",
          center,
          radius: 0.12 + erng() * 0.2,
          strength: 1 + erng() * 2
        })
      }
    }
    return muts
  }, [events, day, userSeed])

  // Выбор биома (фиксированный по seed)
  const biome = useMemo(() => {
    const idx =
      typeof base.biomeIndex === "number"
        ? Math.max(0, Math.min(BIOMES.length - 1, base.biomeIndex))
        : Math.floor(worldRng() * BIOMES.length)
    return BIOMES[idx]
  }, [worldRng, base.biomeIndex])

  // Определяем стадию развития планеты
  const currentStage = stage || "seed"

  // Логика эволюционного развития в зависимости от стадии
  const evolutionProps = useMemo(() => {
    switch (currentStage) {
      case "seed":
        return {
          sizeMultiplier: 0.25, // Очень маленькое семя
          detailLevel: 3, // Минимальная детализация
          treeMultiplier: 0, // Никаких деревьев
          rockMultiplier: 0, // Никаких камней
          noiseIntensity: 0.3 // Слабый рельеф
        }
      case "core":
        return {
          sizeMultiplier: 0.4, // Маленькое ядро
          detailLevel: 5,
          treeMultiplier: 0,
          rockMultiplier: 0,
          noiseIntensity: 0.5
        }
      case "atmosphere":
        return {
          sizeMultiplier: 0.6, // Растущая планета
          detailLevel: 8,
          treeMultiplier: 0.1, // Первые признаки жизни
          rockMultiplier: 0.2,
          noiseIntensity: 0.7
        }
      case "surface":
        return {
          sizeMultiplier: 0.8, // Почти полная планета
          detailLevel: 12,
          treeMultiplier: 0.5,
          rockMultiplier: 0.6,
          noiseIntensity: 0.9
        }
      case "life":
        return {
          sizeMultiplier: 0.95, // Почти зрелая планета
          detailLevel: 14,
          treeMultiplier: 0.8,
          rockMultiplier: 0.8,
          noiseIntensity: 1.0
        }
      case "mature":
      default:
        return {
          sizeMultiplier: 1.0, // Полная планета
          detailLevel: 15,
          treeMultiplier: 1.0,
          rockMultiplier: 1.0,
          noiseIntensity: 1.0
        }
    }
  }, [currentStage])

  // Прогресс от 0..1 за 30 дней (для тонкой настройки внутри стадии)
  const progress = Math.max(0, Math.min(1, (day ?? 1) / 30))

  // Параметры планеты с учётом биома, стадии и прогресса
  const planetProps = useMemo(() => {
    // Применяем эволюционные параметры
    const evolvedRadius = Math.round(base.radius * evolutionProps.sizeMultiplier)
    const evolvedDetail = Math.max(3, evolutionProps.detailLevel)

    // Базовые множители от биома с учетом эволюции
    let noiseD =
      base.noiseConf.noiseD *
      biome.noiseDMultiplier *
      evolutionProps.noiseIntensity *
      (0.7 + 0.5 * progress)
    let noiseF = base.noiseConf.noiseF * biome.noiseFMultiplier

    // Целевой порог воды по биому
    const biomeBaseThresh = Math.max(
      0,
      Math.min(1, base.noiseConf.noiseWaterTreshold + biome.waterThresholdDelta)
    )

    // Клим. траектории (фиксированные по seed мира)
    const arcs = ["desert", "terraform", "oscillate", "glacier", "stable", "tectonic"] as const
    type Arc = (typeof arcs)[number]
    const arc: Arc = arcs[Math.floor(worldRng() * arcs.length)]
    const arcAmp = 0.18 + 0.15 * worldRng() // амплитуда влияния на воду
    const arcPhase = worldRng() * Math.PI * 2
    const tectonicIntensity = 0.6 + 0.8 * worldRng()

    // Эволюция порога воды
    let noiseWaterTreshold = biomeBaseThresh
    switch (arc) {
      case "desert": // воды со временем меньше
        noiseWaterTreshold = biomeBaseThresh - arcAmp * progress
        break
      case "terraform": // воды со временем больше
        noiseWaterTreshold = biomeBaseThresh + arcAmp * progress
        break
      case "oscillate": // колебания, растущие с прогрессом
        noiseWaterTreshold =
          biomeBaseThresh + arcAmp * Math.sin((day + arcPhase) * 0.25) * (0.3 + 0.7 * progress)
        break
      case "glacier": // немного больше воды (льда)
        noiseWaterTreshold = biomeBaseThresh + 0.12 * progress
        break
      case "stable":
        noiseWaterTreshold = biomeBaseThresh
        break
      case "tectonic":
        noiseWaterTreshold = biomeBaseThresh - 0.05 * progress
        noiseF = noiseF * (1 + progress * tectonicIntensity) // усложняем береговую линию
        break
    }

    // Случайные кратковременные явления (потоп/засуха) — короткие пульсы
    const pulseChance = 0.15
    if (rng() < pulseChance) {
      const pulse = (rng() - 0.5) * 0.25 // +/- 0.125
      noiseWaterTreshold += pulse
    }

    // Клиппинг порога
    noiseWaterTreshold = Math.max(0.05, Math.min(0.95, noiseWaterTreshold))

    // Применяем эволюционные множители для деревьев и камней
    const maxTrees = Math.round(
      (base.maxTrees ?? 600) *
        biome.maxTreesMultiplier *
        evolutionProps.treeMultiplier *
        (0.5 + 0.5 * progress)
    )
    const maxRocks = Math.round(
      (base.maxRocks ?? 200) *
        biome.maxRocksMultiplier *
        evolutionProps.rockMultiplier *
        (0.5 + 0.5 * progress)
    )

    return {
      radius: evolvedRadius, // Используем эволюционный размер
      detail: evolvedDetail, // Используем эволюционную детализацию
      groundColor: biome.groundColor,
      waterColor: biome.waterColor,
      noiseConf: {
        ...base.noiseConf,
        noiseD,
        noiseF,
        noiseWaterTreshold
      },
      maxTrees,
      maxRocks,
      treeSize: base.treeSize,
      rockSize: base.rockSize,
      treeTrunkColor: base.treeTrunkColor,
      treeBodyColor1: biome.treePalette[0],
      treeBodyColor2: biome.treePalette[1],
      treeBodyColor3: biome.treePalette[2],
      treeBodyColor4: biome.treePalette[3],
      treeBodyColor5: biome.treePalette[4],
      rockColor: biome.rockColor
    }
  }, [base, progress, biome, worldRng, rng, day, evolutionProps])

  // Функции vNoise и dispV
  const [globeFunctions, setGlobeFunctions] = React.useState<{
    vNoise: (v: Vector3, f: number) => number
    dispV: (v: Vector3) => void
  } | null>(null)

  const treeColorScale = useMemo(() => {
    return createTreeColorScale([
      planetProps.treeBodyColor1,
      planetProps.treeBodyColor2,
      planetProps.treeBodyColor3,
      planetProps.treeBodyColor4,
      planetProps.treeBodyColor5
    ])
  }, [planetProps])

  const { trees, rocks } = useMemo(() => {
    if (!globeFunctions) return { trees: [], rocks: [] }
    const { vNoise, dispV } = globeFunctions

    const max = planetProps.maxTrees + planetProps.maxRocks
    const points = getFibonacciSpherePoints(max, planetProps.radius)

    const treesList: TreeData[] = []
    const rocksList: RockData[] = []

    const percent = planetProps.maxRocks / (planetProps.maxTrees + planetProps.maxRocks)

    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const pointVector = new Vector3(p.x, p.y, p.z)

      // Не ставим объекты на воду
      if (
        vNoise(pointVector, planetProps.noiseConf.noiseF) === planetProps.noiseConf.noiseWaterLevel
      )
        continue

      dispV(pointVector)

      const r = rng()
      if (r > percent && treesList.length < planetProps.maxTrees) {
        const tSize = randFloat(5, 15) * planetProps.treeSize
        const bSize = tSize * randFloat(0.5, 0.7) * planetProps.treeSize
        const vn2 = vNoise(pointVector, 0.01)
        const bColor = treeColorScale(vn2).toString()

        treesList.push({
          tSize,
          tColor: planetProps.treeTrunkColor,
          bSize,
          bColor,
          position: pointVector.clone()
        })
      } else if (rocksList.length < planetProps.maxRocks) {
        rocksList.push({
          color: planetProps.rockColor,
          size: randFloat(2, 4) * planetProps.rockSize,
          position: pointVector.clone()
        })
      }
    }

    return { trees: treesList, rocks: rocksList }
  }, [globeFunctions, planetProps, treeColorScale, rng])

  useFrame((_, delta) => {
    if (groupRef.current && base.autoRotate) {
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  const handleGlobeReady = React.useCallback(
    (vNoise: (v: Vector3, f: number) => number, dispV: (v: Vector3) => void) => {
      setGlobeFunctions({ vNoise, dispV })
    },
    []
  )

  const timeOffset = useMemo(() => rng() * 1000, [rng])

  return (
    <PlanetGroup>
      <group ref={groupRef}>
        <Globe
          radius={planetProps.radius!}
          detail={planetProps.detail!}
          groundColor={planetProps.groundColor!}
          waterColor={planetProps.waterColor!}
          noiseConf={planetProps.noiseConf!}
          timeOffset={timeOffset}
          mutations={mutations}
          onGlobeReady={handleGlobeReady}
        />

        {trees.map((tree, index) => (
          <Tree key={`tree-${index}`} {...tree} lookAt={new Vector3(0, 0, 0)} />
        ))}

        {rocks.map((rock, index) => (
          <Rock key={`rock-${index}`} {...rock} />
        ))}

        <mesh>
          <icosahedronGeometry args={[planetProps.radius, planetProps.detail]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </PlanetGroup>
  )
}

/**
 * Простой компонент планеты
 */
const SimpleLittlePlanet: React.FC<ISimpleLittlePlanetProps> = ({
  isAnimating = true,
  showControls = true,
  autoRotate = false,
  isMobile = false,
  userSeed = "default-seed",
  day = 1,
  events,
  biomeIndex,
  stage = "seed",
  // База как в демке
  radius = 100,
  detail = 15,
  groundColor = "#417B2B",
  waterColor = "#2080D0",
  noiseConf = {
    noiseF: 0.015,
    noiseD: 15,
    noiseWaterTreshold: 0.4,
    noiseWaterLevel: 0.2
  },
  maxTrees = 600,
  maxRocks = 200,
  treeSize = 1,
  rockSize = 1,
  treeTrunkColor = "#764114",
  treeBodyColor1 = "#509A36",
  treeBodyColor2 = "#FF5A36",
  treeBodyColor3 = "#509A36",
  treeBodyColor4 = "#FFC236",
  treeBodyColor5 = "#509A36",
  rockColor = "#808080"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{
          position: [0, 0, isMobile ? 380 : 260],
          fov: 55,
          near: 0.1,
          far: 4000
        }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows={true}
        dpr={isMobile ? [1, 1.2] : [1, 1.5]}
        performance={{ min: 0.5 }}
        style={{ background: "transparent", width: "100%", height: "100%" }}>
        <Suspense
          fallback={
            <Html center>
              <Loading />
            </Html>
          }>
          <ambientLight color="#fffaf0" intensity={0.6} />
          <directionalLight
            position={[120, 140, 80]}
            intensity={1.1}
            color="#ffffff"
            castShadow={true}
            shadow-mapSize-width={isMobile ? 1024 : 2048}
            shadow-mapSize-height={isMobile ? 1024 : 2048}
            shadow-camera-far={600}
            shadow-camera-left={-220}
            shadow-camera-right={220}
            shadow-camera-top={220}
            shadow-camera-bottom={-220}
          />
          <pointLight position={[-60, 60, 120]} intensity={0.35} color="#ffd08a" />
          <Stars
            radius={900}
            depth={40}
            count={isMobile ? 1000 : 2000}
            factor={3.2}
            saturation={0}
            fade
            speed={1}
          />

          <LittlePlanetScene
            userSeed={userSeed}
            day={day}
            events={events}
            stage={stage}
            base={{
              isAnimating,
              showControls,
              autoRotate,
              isMobile,
              stage,
              radius,
              detail,
              groundColor,
              waterColor,
              noiseConf,
              maxTrees,
              maxRocks,
              treeSize,
              rockSize,
              treeTrunkColor,
              treeBodyColor1,
              treeBodyColor2,
              treeBodyColor3,
              treeBodyColor4,
              treeBodyColor5,
              rockColor,
              biomeIndex: biomeIndex || 0
            }}
          />

          {showControls && (
            <OrbitControls
              enableZoom
              enableRotate
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              minDistance={150}
              maxDistance={800}
              makeDefault
            />
          )}
        </Suspense>
      </Canvas>
    </motion.div>
  )
}

export default SimpleLittlePlanet
