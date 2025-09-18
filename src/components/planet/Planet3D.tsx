import React, { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Ring, Html, Stars } from "@react-three/drei"
import { Mesh, Group } from "three"
import { motion } from "framer-motion"
import seedrandom from "seedrandom"
import { IPlanetData, ISatellite } from "@/types"
import { STAGE_SIZES } from "@/constants"
import Loading from "@/components/ui/Loading"
import { cn } from "@/utils"

interface IPlanet3DProps {
  planetData: IPlanetData
  userSeed?: string
  className?: string
  showControls?: boolean
  autoRotate?: boolean
  enableInteraction?: boolean
  cameraPosition?: [number, number, number]
}

/**
 * 3D представление планеты с использованием React Three Fiber
 * Оптимизировано для производительности на мобильных устройствах
 */
const Planet3D: React.FC<IPlanet3DProps> = ({
  planetData,
  userSeed,
  className,
  showControls = false,
  autoRotate = true,
  enableInteraction = true,
  cameraPosition
}) => {
  // Динамически рассчитываем позицию камеры в зависимости от размера планеты
  const dynamicCameraPosition = useMemo(() => {
    if (cameraPosition) return cameraPosition

    const planetRadius = Math.max(STAGE_SIZES[planetData.stage] * 1.5, 0.5)
    const satelliteMaxDistance = Math.max(...planetData.satellites.map((s) => s.distance), 0)
    const sceneRadius = planetRadius + satelliteMaxDistance + 1

    // Камера должна быть на достаточном расстоянии, чтобы видеть всю сцену
    const cameraDistance = Math.max(sceneRadius * 2.5, 3)

    return [0, 0, cameraDistance] as [number, number, number]
  }, [cameraPosition, planetData.stage, planetData.satellites])

  // Динамически рассчитываем границы для OrbitControls
  const controlLimits = useMemo(() => {
    const planetRadius = Math.max(STAGE_SIZES[planetData.stage] * 1.5, 0.5)
    const satelliteMaxDistance = Math.max(...planetData.satellites.map((s) => s.distance), 0)
    const sceneRadius = planetRadius + satelliteMaxDistance + 1

    return {
      minDistance: Math.max(planetRadius * 1.2, 1),
      maxDistance: sceneRadius * 5
    }
  }, [planetData.stage, planetData.satellites])
  return (
    <motion.div
      className={cn("w-full h-full min-h-[400px]", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      <Canvas
        camera={{
          position: dynamicCameraPosition,
          fov: 75, // Увеличиваем FOV для устранения обрезания
          near: 0.1,
          far: controlLimits.maxDistance * 3,
          aspect: window.innerWidth / window.innerHeight
        }}
        gl={{
          antialias: false, // Отключаем для производительности
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]} // Уменьшаем DPR для лучшей производительности
        style={{ background: "transparent" }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}>
        <Suspense
          fallback={
            <Html center>
              <Loading variant="cosmic" size="lg" />
            </Html>
          }>
          {/* Звездное небо (уменьшенное количество) */}
          <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade={true} />

          {/* Оптимизированное освещение */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1.0}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />

          <PlanetMesh planetData={planetData} userSeed={userSeed} autoRotate={autoRotate} />

          {showControls && enableInteraction && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              minDistance={controlLimits.minDistance}
              maxDistance={controlLimits.maxDistance}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
            />
          )}
        </Suspense>
      </Canvas>
    </motion.div>
  )
}

/**
 * Основной меш планеты
 */
const PlanetMesh: React.FC<{
  planetData: IPlanetData
  userSeed?: string
  autoRotate: boolean
}> = ({ planetData, userSeed, autoRotate }) => {
  const meshRef = useRef<Mesh>(null!)
  // Увеличиваем минимальный размер для ранних стадий
  const baseRadius = STAGE_SIZES[planetData.stage] * 1.5
  const minRadius = 0.5 // Минимальный радиус для видимости
  const radius = Math.max(baseRadius, minRadius)

  // Анимация вращения
  useFrame((_, _delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += _delta * 0.2
    }
  })

  const planetColor = useMemo(() => planetData.color, [planetData.color])

  return (
    <group>
      {/* Основная планета (оптимизированная) */}
      <Sphere ref={meshRef} args={[radius, 32, 24]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={planetColor}
          roughness={planetData.stage === "seed" ? 0.9 : 0.6}
          metalness={planetData.stage === "mature" ? 0.3 : 0.1}
          transparent={false}
          emissive={planetData.stage === "core" ? "#331100" : "#000000"}
          emissiveIntensity={planetData.stage === "core" ? 0.2 : 0}
        />
      </Sphere>

      {/* Элементы поверхности */}
      <SurfaceElements planetData={planetData} planetRadius={radius} userSeed={userSeed} />

      {/* Оптимизированная атмосфера */}
      {planetData.atmosphere > 0 && (
        <Sphere args={[radius * 1.08, 16, 12]}>
          <meshBasicMaterial
            color="#87CEEB"
            transparent
            opacity={Math.min(planetData.atmosphere * 0.4, 0.5)}
            depthWrite={false}
          />
        </Sphere>
      )}

      {/* Кольца (если есть спутники кольцевого типа) */}
      {planetData.satellites
        .filter((sat) => sat.type === "ring")
        .map((ring, index) => (
          <RingMesh key={ring.id} satellite={ring} planetRadius={radius} index={index} />
        ))}

      {/* Спутники */}
      {planetData.satellites
        .filter((sat) => sat.type === "moon")
        .map((satellite, index) => (
          <SatelliteMesh
            key={satellite.id}
            satellite={satellite}
            planetRadius={radius}
            index={index}
          />
        ))}
    </group>
  )
}

/**
 * Компонент элементов поверхности планеты
 */
const SurfaceElements: React.FC<{
  planetData: IPlanetData
  planetRadius: number
  userSeed?: string
}> = ({ planetData, planetRadius, userSeed }) => {
  const elementsRef = useRef<Group>(null!)

  // Анимация элементов
  useFrame((_, _delta) => {
    if (elementsRef.current) {
      elementsRef.current.rotation.y += _delta * 0.1
    }
  })

  // Детерминированная функция генерации
  const rng = useMemo(() => {
    if (!userSeed) return Math.random
    return seedrandom(`${userSeed}-surface-${planetData.stage}-${planetData.currentDay}`)
  }, [userSeed, planetData.stage, planetData.currentDay])

  const renderSurfaceFeatures = () => {
    const features = []
    const stage = planetData.stage

    switch (stage) {
      case "seed":
        // Для семени просто мерцающие точки
        for (let i = 0; i < 3; i++) {
          const phi = rng() * Math.PI * 2
          const theta = rng() * Math.PI
          const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.01
          const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.01
          const z = Math.cos(theta) * planetRadius * 1.01

          features.push(
            <Sphere key={`seed-${i}`} args={[0.02, 4, 4]} position={[x, y, z]}>
              <meshBasicMaterial color="#FFFF88" transparent opacity={0.8} />
            </Sphere>
          )
        }
        break

      case "core":
        // Вулканы и лавовые потоки
        for (let i = 0; i < 8; i++) {
          const phi = (i * Math.PI * 2) / 8
          const theta = Math.PI / 2 + (rng() - 0.5) * 0.5
          const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.05
          const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.05
          const z = Math.cos(theta) * planetRadius * 1.05

          // Вулканический конус
          features.push(
            <mesh key={`volcano-${i}`} position={[x, y, z]}>
              <coneGeometry args={[0.08, 0.15, 6]} />
              <meshStandardMaterial color="#8B4513" emissive="#FF4500" emissiveIntensity={0.2} />
            </mesh>
          )

          // Лавовое свечение
          features.push(
            <Sphere key={`lava-${i}`} args={[0.04, 4, 4]} position={[x, y, z + 0.1]}>
              <meshBasicMaterial color="#FF6600" transparent opacity={0.8} />
            </Sphere>
          )
        }
        break

      case "atmosphere":
        // Облака на поверхности
        for (let i = 0; i < 12; i++) {
          const phi = rng() * Math.PI * 2
          const theta = rng() * Math.PI
          const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.02
          const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.02
          const z = Math.cos(theta) * planetRadius * 1.02

          features.push(
            <Sphere key={`cloud-${i}`} args={[0.1, 6, 4]} position={[x, y, z]}>
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
            </Sphere>
          )
        }
        break

      case "surface":
        // Континенты и океаны
        for (let i = 0; i < 6; i++) {
          const phi = (i * Math.PI * 2) / 6
          const theta = Math.PI / 2 + (rng() - 0.5) * 1.0
          const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.01
          const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.01
          const z = Math.cos(theta) * planetRadius * 1.01

          // Континенты (зеленые и коричневые пятна)
          const isLand = i % 2 === 0
          features.push(
            <Sphere key={`continent-${i}`} args={[0.15, 8, 6]} position={[x, y, z]}>
              <meshStandardMaterial
                color={isLand ? "#228B22" : "#4169E1"}
                roughness={isLand ? 0.8 : 0.1}
                metalness={isLand ? 0 : 0.3}
              />
            </Sphere>
          )
        }

        // Водные объекты (блестящие пятна)
        if (planetData.water > 0.3) {
          for (let i = 0; i < 4; i++) {
            const phi = rng() * Math.PI * 2
            const theta = rng() * Math.PI
            const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.005
            const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.005
            const z = Math.cos(theta) * planetRadius * 1.005

            features.push(
              <Sphere key={`water-${i}`} args={[0.12, 6, 4]} position={[x, y, z]}>
                <meshStandardMaterial
                  color="#1E90FF"
                  roughness={0.1}
                  metalness={0.5}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            )
          }
        }
        break

      case "life":
        // Леса, города, зеленые зоны
        for (let i = 0; i < 16; i++) {
          const phi = rng() * Math.PI * 2
          const theta = rng() * Math.PI
          const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.02
          const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.02
          const z = Math.cos(theta) * planetRadius * 1.02

          const isForest = i % 3 !== 0
          if (isForest) {
            // Леса (зеленые кластеры)
            features.push(
              <mesh key={`forest-${i}`} position={[x, y, z]}>
                <cylinderGeometry args={[0.03, 0.06, 0.12, 6]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            )
          } else {
            // Первые города (желтые огоньки)
            features.push(
              <Sphere key={`city-${i}`} args={[0.03, 4, 4]} position={[x, y, z]}>
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
              </Sphere>
            )
          }
        }
        break

      case "mature":
        // Развитые города, технологии
        for (let i = 0; i < 24; i++) {
          const phi = rng() * Math.PI * 2
          const theta = rng() * Math.PI
          const x = Math.cos(phi) * Math.sin(theta) * planetRadius * 1.03
          const y = Math.sin(phi) * Math.sin(theta) * planetRadius * 1.03
          const z = Math.cos(theta) * planetRadius * 1.03

          const buildingType = i % 4

          if (buildingType === 0) {
            // Высокие здания
            features.push(
              <mesh key={`building-${i}`} position={[x, y, z]}>
                <boxGeometry args={[0.04, 0.04, 0.16]} />
                <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
              </mesh>
            )
          } else if (buildingType === 1) {
            // Огни мегаполисов
            features.push(
              <Sphere key={`megacity-${i}`} args={[0.04, 4, 4]} position={[x, y, z]}>
                <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.7} />
              </Sphere>
            )
          } else if (buildingType === 2) {
            // Зеленые зоны (парки)
            features.push(
              <Sphere key={`park-${i}`} args={[0.06, 6, 4]} position={[x, y, z]}>
                <meshStandardMaterial color="#32CD32" />
              </Sphere>
            )
          } else {
            // Технологические структуры
            features.push(
              <mesh key={`tech-${i}`} position={[x, y, z]}>
                <octahedronGeometry args={[0.05, 0]} />
                <meshStandardMaterial
                  color="#FF69B4"
                  emissive="#FF69B4"
                  emissiveIntensity={0.3}
                  metalness={0.8}
                />
              </mesh>
            )
          }
        }
        break
    }

    return features
  }

  return <group ref={elementsRef}>{renderSurfaceFeatures()}</group>
}

/**
 * Компонент спутника
 */
const SatelliteMesh: React.FC<{
  satellite: ISatellite
  planetRadius: number
  index: number
}> = ({ satellite, planetRadius, index }) => {
  const satelliteRef = useRef<Group>(null!)
  const orbitRadius = planetRadius + satellite.distance
  const satelliteRadius = Math.max(satellite.size * 0.4, 0.1) // Увеличиваем размер спутников

  useFrame((_, _delta) => {
    if (satelliteRef.current) {
      const time = Date.now() * 0.001
      const angle = time * satellite.orbitSpeed * 0.1 + index * 2
      satelliteRef.current.position.x = Math.cos(angle) * orbitRadius
      satelliteRef.current.position.z = Math.sin(angle) * orbitRadius
    }
  })

  return (
    <group ref={satelliteRef}>
      <Sphere args={[satelliteRadius, 8, 6]} castShadow>
        <meshStandardMaterial
          color={satellite.color}
          roughness={0.7}
          metalness={0.2}
          emissive={satellite.color}
          emissiveIntensity={0.1}
        />
      </Sphere>
      {/* Оптимизированное свечение */}
      <Sphere args={[satelliteRadius * 1.2, 6, 4]}>
        <meshBasicMaterial color={satellite.color} transparent opacity={0.3} depthWrite={false} />
      </Sphere>
    </group>
  )
}

/**
 * Компонент кольца
 */
const RingMesh: React.FC<{
  satellite: ISatellite
  planetRadius: number
  index: number
}> = ({ satellite, planetRadius, index: _index }) => {
  const ringRef = useRef<Mesh>(null!)
  const innerRadius = planetRadius + satellite.distance
  const outerRadius = innerRadius + satellite.size

  useFrame((_, _delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += _delta * satellite.orbitSpeed * 0.1
    }
  })

  return (
    <group>
      <Ring ref={ringRef} args={[innerRadius, outerRadius, 32]} rotation-x={Math.PI * 0.5}>
        <meshBasicMaterial
          color={satellite.color}
          transparent
          opacity={0.8}
          side={2} // DoubleSide
        />
      </Ring>
      {/* Оптимизированные частицы кольца */}
      <Ring args={[innerRadius * 1.02, outerRadius * 0.98, 16]} rotation-x={Math.PI * 0.5}>
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} side={2} />
      </Ring>
    </group>
  )
}

// Убран старый компонент StageEffects - заменен на SurfaceElements

// Fallback для слабых устройств
export const Planet3DFallback: React.FC<{ planetData: IPlanetData; className?: string }> = ({
  planetData,
  className
}) => (
  <div
    className={cn(
      "w-full h-full min-h-[400px] flex items-center justify-center",
      "bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg",
      className
    )}>
    <div className="text-center">
      <div className="text-6xl mb-4">🌍</div>
      <p className="text-white/70 text-sm">3D модель недоступна на этом устройстве</p>
      <p className="text-white/50 text-xs mt-2">
        День {planetData.currentDay} • {planetData.stage}
      </p>
    </div>
  </div>
)

export default Planet3D
