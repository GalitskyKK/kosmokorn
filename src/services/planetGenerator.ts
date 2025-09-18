import seedrandom from "seedrandom"
import {
  IPlanetData,
  IPlanetEvent,
  ISatellite,
  ILifeform,
  PlanetStage,
  EventType,
  LifeformType
} from "@/types"
import {
  PLANET_GENERATOR_CONFIG,
  STAGE_REQUIREMENTS,
  STAGE_COLORS,
  STAGE_SIZES,
  EVENT_NAMES,
  EVENT_PROBABILITIES
} from "@/constants"

/**
 * Класс для детерминированной генерации планет
 * Использует seedrandom для обеспечения воспроизводимости результатов
 */
export class PlanetGenerator {
  private rng: () => number
  private seed: string

  constructor(seed: string) {
    this.seed = seed
    this.rng = seedrandom(seed)
  }

  /**
   * Генерирует полные данные планеты для указанного дня
   */
  generatePlanetData(day: number): IPlanetData {
    // Создаем новый генератор для каждого дня, чтобы обеспечить детерминизм
    const dayRng = seedrandom(`${this.seed}-${day}`)

    const stage = this.calculateStage(day)
    const baseRadius = this.calculateRadius(stage)
    const color = this.calculateColor(stage, dayRng)
    const temperature = this.calculateTemperature(day, dayRng)
    const atmosphere = this.calculateAtmosphere(day, stage, dayRng)
    const water = this.calculateWater(day, stage, dayRng)
    const life = this.calculateLife(day, stage, dayRng)

    return {
      seed: this.seed,
      currentDay: day,
      stage,
      color,
      radius: baseRadius,
      temperature,
      atmosphere,
      water,
      life,
      satellites: this.generateSatellites(day, dayRng),
      events: this.generateEventsHistory(day),
      lifeforms: this.generateLifeforms(day, life, dayRng),
      resources: {
        minerals: this.calculateMinerals(day, dayRng),
        gases: atmosphere,
        water,
        energy: this.calculateEnergy(day, temperature, dayRng)
      },
      evolution: {
        evolutionPoints: this.calculateEvolutionPoints(day),
        nextStageProgress: this.calculateStageProgress(day, stage),
        stageRequirements: STAGE_REQUIREMENTS[this.getNextStage(stage) || stage]
      }
    }
  }

  /**
   * Определяет текущую стадию планеты на основе дня и условий
   */
  private calculateStage(day: number): PlanetStage {
    const stages: PlanetStage[] = ["seed", "core", "atmosphere", "surface", "life", "mature"]

    for (let i = stages.length - 1; i >= 0; i--) {
      const stage = stages[i]
      const requirements = STAGE_REQUIREMENTS[stage]

      if (day >= requirements.minDays) {
        return stage
      }
    }

    return "seed"
  }

  /**
   * Рассчитывает радиус планеты
   */
  private calculateRadius(stage: PlanetStage): number {
    const baseSize = STAGE_SIZES[stage]
    const variation = 0.2 // 20% вариации
    const randomFactor = 1 + (this.rng() - 0.5) * variation

    return Math.max(0.1, baseSize * randomFactor)
  }

  /**
   * Определяет цвет планеты на основе стадии
   */
  private calculateColor(stage: PlanetStage, rng: () => number): string {
    const baseColor = STAGE_COLORS[stage]

    // Добавляем небольшие вариации в цвет
    const variations = [baseColor]

    switch (stage) {
      case "seed":
        variations.push("#4B5563", "#6B7280", "#9CA3AF")
        break
      case "core":
        variations.push("#DC2626", "#EF4444", "#F87171")
        break
      case "atmosphere":
        variations.push("#F59E0B", "#FBBF24", "#FCD34D")
        break
      case "surface":
        variations.push("#059669", "#10B981", "#34D399")
        break
      case "life":
        variations.push("#3B82F6", "#60A5FA", "#93C5FD")
        break
      case "mature":
        variations.push("#8B5CF6", "#A78BFA", "#C4B5FD")
        break
    }

    return variations[Math.floor(rng() * variations.length)]
  }

  /**
   * Рассчитывает температуру планеты
   */
  private calculateTemperature(day: number, rng: () => number): number {
    const config = PLANET_GENERATOR_CONFIG
    const baseTemp = config.baseTemperature
    const variation = config.temperatureVariation

    // Температура изменяется со временем и имеет случайные флуктуации
    const timeEffect = Math.sin(day * 0.1) * 50
    const randomEffect = (rng() - 0.5) * variation

    return Math.max(50, baseTemp + timeEffect + randomEffect)
  }

  /**
   * Рассчитывает плотность атмосферы
   */
  private calculateAtmosphere(day: number, stage: PlanetStage, rng: () => number): number {
    let baseAtmosphere = 0

    switch (stage) {
      case "seed":
      case "core":
        baseAtmosphere = 0
        break
      case "atmosphere":
        baseAtmosphere = 0.3
        break
      case "surface":
        baseAtmosphere = 0.6
        break
      case "life":
        baseAtmosphere = 0.8
        break
      case "mature":
        baseAtmosphere = 1.0
        break
    }

    const dayEffect = Math.min(day * 0.01, 0.5)
    const randomEffect = rng() * 0.2

    return Math.min(1, Math.max(0, baseAtmosphere + dayEffect + randomEffect))
  }

  /**
   * Рассчитывает количество воды
   */
  private calculateWater(day: number, stage: PlanetStage, rng: () => number): number {
    if (stage === "seed" || stage === "core") return 0

    const waterProbability = PLANET_GENERATOR_CONFIG.waterProbability
    const hasWater = rng() < waterProbability

    if (!hasWater) return 0

    let baseWater = 0
    switch (stage) {
      case "atmosphere":
        baseWater = 0.1
        break
      case "surface":
        baseWater = 0.4
        break
      case "life":
        baseWater = 0.7
        break
      case "mature":
        baseWater = 0.8
        break
    }

    const dayEffect = Math.min(day * 0.005, 0.3)
    const randomEffect = rng() * 0.3

    return Math.min(1, baseWater + dayEffect + randomEffect)
  }

  /**
   * Рассчитывает уровень жизни
   */
  private calculateLife(day: number, stage: PlanetStage, rng: () => number): number {
    if (stage !== "life" && stage !== "mature") return 0

    const lifeProbability = PLANET_GENERATOR_CONFIG.lifeProbability
    const hasLife = rng() < lifeProbability

    if (!hasLife) return 0

    let baseLife = stage === "life" ? 0.3 : 0.8
    const dayEffect = Math.min((day - 30) * 0.01, 0.5)
    const randomEffect = rng() * 0.2

    return Math.min(1, Math.max(0, baseLife + dayEffect + randomEffect))
  }

  /**
   * Генерирует спутники планеты
   */
  private generateSatellites(day: number, rng: () => number): ISatellite[] {
    const satellites: ISatellite[] = []
    const satelliteProbability = PLANET_GENERATOR_CONFIG.satelliteProbability

    // Максимум 3 спутника
    for (let i = 0; i < 3; i++) {
      if (rng() < satelliteProbability && day > i * 10) {
        const satellite: ISatellite = {
          id: `satellite-${i}`,
          name: this.generateSatelliteName(i, rng),
          size: 0.1 + rng() * 0.3,
          distance: 2 + i * 1.5 + rng() * 0.5,
          color: this.generateSatelliteColor(rng),
          orbitSpeed: 1 + rng() * 2,
          type: this.generateSatelliteType(rng)
        }
        satellites.push(satellite)
      }
    }

    return satellites
  }

  /**
   * Генерирует имя спутника
   */
  private generateSatelliteName(index: number, rng: () => number): string {
    const names = [
      ["Луна", "Селена", "Диана", "Артемида"],
      ["Фобос", "Деймос", "Титан", "Европа"],
      ["Ио", "Каллисто", "Ганимед", "Энцелад"]
    ]

    const nameSet = names[index] || names[0]
    return nameSet[Math.floor(rng() * nameSet.length)]
  }

  /**
   * Генерирует цвет спутника
   */
  private generateSatelliteColor(rng: () => number): string {
    const colors = ["#9CA3AF", "#6B7280", "#4B5563", "#D1D5DB", "#F3F4F6"]
    return colors[Math.floor(rng() * colors.length)]
  }

  /**
   * Определяет тип спутника
   */
  private generateSatelliteType(rng: () => number): "moon" | "ring" | "debris" {
    const rand = rng()
    if (rand < 0.7) return "moon"
    if (rand < 0.9) return "ring"
    return "debris"
  }

  /**
   * Генерирует историю событий до указанного дня
   */
  generateEventsHistory(maxDay: number): IPlanetEvent[] {
    const events: IPlanetEvent[] = []

    for (let day = 1; day <= maxDay; day++) {
      const dayRng = seedrandom(`${this.seed}-events-${day}`)

      // Определяем вероятность события для этого дня
      let probability = EVENT_PROBABILITIES.early
      if (day > 30) probability = EVENT_PROBABILITIES.late
      else if (day > 7) probability = EVENT_PROBABILITIES.middle

      if (dayRng() < probability) {
        const event = this.generateEvent(day, dayRng)
        events.push(event)
      }
    }

    return events
  }

  /**
   * Генерирует событие для конкретного дня
   */
  private generateEvent(day: number, rng: () => number): IPlanetEvent {
    const eventTypes = Object.values(EventType)
    const type = eventTypes[Math.floor(rng() * eventTypes.length)]
    const names = EVENT_NAMES[type]
    const title = names[Math.floor(rng() * names.length)]

    return {
      id: `event-${day}-${type}`,
      type,
      title,
      description: this.generateEventDescription(type, rng),
      day,
      impact: this.generateEventImpact(type, rng),
      duration: Math.floor(rng() * 3) + 1,
      probability: rng()
    }
  }

  /**
   * Генерирует описание события
   */
  private generateEventDescription(type: EventType, rng: () => number): string {
    const descriptions = {
      [EventType.COMET]: [
        "Яркая комета пролетает рядом с планетой",
        "Ледяной странник приносит воду и органику",
        "Хвост кометы освещает небо планеты"
      ],
      [EventType.SOLAR_FLARE]: [
        "Солнечная буря достигает планеты",
        "Магнитное поле планеты испытывает возмущения",
        "Корональный выброс влияет на атмосферу"
      ],
      [EventType.TECTONIC]: [
        "Тектонические плиты смещаются",
        "Мощное землетрясение меняет ландшафт",
        "Формируются новые горные хребты"
      ],
      [EventType.VOLCANIC]: [
        "Супервулкан извергается",
        "Лава формирует новые земли",
        "Пепел временно закрывает солнце"
      ],
      [EventType.METEOR]: [
        "Метеоритный дождь падает на планету",
        "Крупный метеор оставляет кратер",
        "Космические камни приносят редкие минералы"
      ],
      [EventType.ASTEROID]: [
        "Крупный астероид пролетает мимо",
        "Гравитация астероида влияет на приливы",
        "Железный гигант меняет орбиту спутников"
      ],
      [EventType.AURORA]: [
        "Северное сияние освещает полюса",
        "Магнитное поле создает световое шоу",
        "Плазменные танцы украшают небо"
      ]
    }

    const typeDescriptions = descriptions[type]
    return typeDescriptions[Math.floor(rng() * typeDescriptions.length)]
  }

  /**
   * Генерирует влияние события на планету
   */
  private generateEventImpact(type: EventType, rng: () => number): any {
    const impact: any = {}

    switch (type) {
      case EventType.COMET:
        impact.water = (rng() - 0.5) * 0.2
        impact.life = (rng() - 0.5) * 0.1
        break
      case EventType.SOLAR_FLARE:
        impact.temperature = (rng() - 0.3) * 100
        impact.atmosphere = (rng() - 0.7) * 0.1
        break
      case EventType.TECTONIC:
        impact.radius = rng() * 0.05
        break
      case EventType.VOLCANIC:
        impact.temperature = rng() * 50
        impact.atmosphere = rng() * 0.1
        break
      case EventType.METEOR:
        impact.radius = (rng() - 0.5) * 0.02
        break
      case EventType.ASTEROID:
        impact.radius = rng() * 0.01
        break
      case EventType.AURORA:
        // Положительное влияние на жизнь
        impact.life = rng() * 0.05
        break
    }

    return impact
  }

  /**
   * Генерирует формы жизни
   */
  private generateLifeforms(day: number, lifeLevel: number, rng: () => number): ILifeform[] {
    if (lifeLevel === 0) return []

    const lifeforms: ILifeform[] = []
    const maxLifeforms = Math.min(5, Math.floor(lifeLevel * 10))

    for (let i = 0; i < maxLifeforms; i++) {
      if (rng() < 0.6) {
        lifeforms.push(this.generateLifeform(day, i, rng))
      }
    }

    return lifeforms
  }

  /**
   * Генерирует форму жизни
   */
  private generateLifeform(day: number, index: number, rng: () => number): ILifeform {
    const types = Object.values(LifeformType)
    const type = types[Math.min(index, types.length - 1)]

    return {
      id: `lifeform-${index}`,
      type,
      name: this.generateLifeformName(type, rng),
      population: Math.floor(rng() * 1000000) + 1000,
      complexity: Math.min(index + 1, 5),
      dayAppeared: Math.max(1, day - Math.floor(rng() * 20)),
      description: this.generateLifeformDescription(type, rng)
    }
  }

  /**
   * Генерирует название формы жизни
   */
  private generateLifeformName(type: LifeformType, rng: () => number): string {
    const names = {
      [LifeformType.MICROORGANISM]: ["Археи", "Бактерии", "Цианобактерии"],
      [LifeformType.PLANT]: ["Водоросли", "Мхи", "Папоротники", "Деревья"],
      [LifeformType.ANIMAL]: ["Простейшие", "Членистоногие", "Рыбы", "Рептилии"],
      [LifeformType.INTELLIGENT]: ["Приматы", "Разумные существа", "Цивилизация"],
      [LifeformType.ADVANCED]: ["Высшая раса", "Технологическая цивилизация"]
    }

    const typeNames = names[type]
    return typeNames[Math.floor(rng() * typeNames.length)]
  }

  /**
   * Генерирует описание формы жизни
   */
  private generateLifeformDescription(type: LifeformType, rng: () => number): string {
    const descriptions = {
      [LifeformType.MICROORGANISM]: [
        "Простейшие одноклеточные организмы",
        "Основа всей жизни на планете",
        "Первые живые существа в океанах"
      ],
      [LifeformType.PLANT]: [
        "Фотосинтезирующие организмы",
        "Производят кислород для атмосферы",
        "Основа пищевых цепей"
      ],
      [LifeformType.ANIMAL]: [
        "Многоклеточные подвижные организмы",
        "Разнообразные формы жизни",
        "Активные потребители энергии"
      ],
      [LifeformType.INTELLIGENT]: [
        "Разумные существа с развитым мозгом",
        "Способны к абстрактному мышлению",
        "Создают инструменты и культуру"
      ],
      [LifeformType.ADVANCED]: [
        "Высокоразвитая технологическая цивилизация",
        "Освоили космические технологии",
        "Способны изменять свою планету"
      ]
    }

    const typeDescriptions = descriptions[type]
    return typeDescriptions[Math.floor(rng() * typeDescriptions.length)]
  }

  // Дополнительные вспомогательные методы
  private calculateMinerals(day: number, rng: () => number): number {
    return Math.min(1, day * 0.01 + rng() * 0.3)
  }

  private calculateEnergy(day: number, temperature: number, rng: () => number): number {
    const tempFactor = Math.max(0, (temperature - 200) / 200)
    return Math.min(1, tempFactor + day * 0.005 + rng() * 0.2)
  }

  private calculateEvolutionPoints(day: number): number {
    return Math.floor(day * 10 + Math.sqrt(day) * 5)
  }

  private calculateStageProgress(day: number, stage: PlanetStage): number {
    const nextStage = this.getNextStage(stage)
    if (!nextStage) return 1

    const nextRequirements = STAGE_REQUIREMENTS[nextStage]
    const progress = Math.min(1, day / nextRequirements.minDays)
    return progress
  }

  private getNextStage(currentStage: PlanetStage): PlanetStage | null {
    const stages: PlanetStage[] = ["seed", "core", "atmosphere", "surface", "life", "mature"]
    const currentIndex = stages.indexOf(currentStage)
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null
  }
}

export default PlanetGenerator
