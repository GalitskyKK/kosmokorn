// Основные типы проекта KosmoKorn

// Стадии эволюции планеты
export type PlanetStage = "seed" | "core" | "atmosphere" | "surface" | "life" | "mature"

// Типы событий
export enum EventType {
  COMET = "comet",
  SOLAR_FLARE = "solar_flare",
  TECTONIC = "tectonic",
  VOLCANIC = "volcanic",
  METEOR = "meteor",
  ASTEROID = "asteroid",
  AURORA = "aurora"
}

// Типы форм жизни
export enum LifeformType {
  MICROORGANISM = "microorganism",
  PLANT = "plant",
  ANIMAL = "animal",
  INTELLIGENT = "intelligent",
  ADVANCED = "advanced"
}

// Основной интерфейс данных планеты
export interface IPlanetData {
  seed: string
  currentDay: number
  stage: PlanetStage
  color: string
  radius: number
  temperature: number
  atmosphere: number
  water: number
  life: number
  satellites: ISatellite[]
  events: IPlanetEvent[]
  lifeforms: ILifeform[]
  resources: IPlanetResources
  evolution: IPlanetEvolution
}

// Интерфейс спутника
export interface ISatellite {
  id: string
  name: string
  size: number
  distance: number
  color: string
  orbitSpeed: number
  type: "moon" | "ring" | "debris"
}

// Интерфейс события планеты
export interface IPlanetEvent {
  id: string
  type: EventType
  title: string
  description: string
  day: number
  impact: IEventImpact
  duration: number
  probability: number
}

// Влияние события на планету
export interface IEventImpact {
  temperature?: number
  atmosphere?: number
  water?: number
  life?: number
  radius?: number
}

// Интерфейс формы жизни
export interface ILifeform {
  id: string
  type: LifeformType
  name: string
  population: number
  complexity: number
  dayAppeared: number
  description: string
}

// Ресурсы планеты
export interface IPlanetResources {
  minerals: number
  gases: number
  water: number
  energy: number
}

// Эволюционные параметры
export interface IPlanetEvolution {
  evolutionPoints: number
  nextStageProgress: number
  stageRequirements: IStageRequirements
}

// Требования для следующей стадии
export interface IStageRequirements {
  minDays: number
  minTemperature?: number
  maxTemperature?: number
  minAtmosphere?: number
  minWater?: number
  minLife?: number
}

// Конфигурация генератора планет
export interface IPlanetGeneratorConfig {
  baseTemperature: number
  temperatureVariation: number
  atmosphereDensity: number
  waterProbability: number
  lifeProbability: number
  eventFrequency: number
  satelliteProbability: number
}

// Данные пользователя
export interface IUserData {
  seed: string
  planetName: string
  currentDay: number
  lastVisit: Date
  totalVisits: number
  achievements: string[]
  settings: IUserSettings
}

// Настройки пользователя
export interface IUserSettings {
  enableSound: boolean
  enableAnimations: boolean
  theme: "space" | "cosmic" | "galaxy"
  language: "ru" | "en"
  notifications: boolean
}

// Данные для localStorage
export interface IStorageData {
  userData: IUserData
  planetData: IPlanetData | null
  eventHistory: IPlanetEvent[]
  version: string
}

// Компонентные пропсы
export interface IPlanetSceneProps {
  planetData: IPlanetData
  isAnimating: boolean
  onEventTrigger: (event: IPlanetEvent) => void
  showControls?: boolean
}

export interface IPlanet3DProps {
  radius: number
  color: string
  texture?: string
  satellites: ISatellite[]
  showAtmosphere?: boolean
  rotationSpeed?: number
}

export interface IEventLogProps {
  events: IPlanetEvent[]
  maxEvents?: number
  onEventClick?: (event: IPlanetEvent) => void
}

export interface IUserInterfaceProps {
  planetData: IPlanetData
  userData: IUserData
  onVisitComplete: () => void
  onSettingsChange: (settings: IUserSettings) => void
}

// Хуки
export interface IUsePlanetEvolution {
  planetData: IPlanetData | null
  isLoading: boolean
  error: string | null
  triggerEvolution: () => void
  resetPlanet: () => void
}

export interface IUseDailyCheck {
  isNewDay: boolean
  daysPassed: number
  lastVisit: Date | null
  updateLastVisit: () => void
}

export interface IUseLocalStorage<T> {
  value: T
  setValue: (value: T) => void
  clearValue: () => void
  isLoading: boolean
}

// Состояние приложения
export interface IAppState {
  isInitialized: boolean
  isFirstVisit: boolean
  currentView: "welcome" | "planet" | "evolution" | "events" | "settings"
  isLoading: boolean
  error: string | null
}

// Анимационные варианты
export interface IAnimationVariants {
  initial: object
  animate: object
  exit?: object
  hover?: object
  tap?: object
}

// Конфигурация 3D сцены
export interface I3DSceneConfig {
  cameraPosition: [number, number, number]
  enableControls: boolean
  enableZoom: boolean
  enablePan: boolean
  ambientLightIntensity: number
  pointLightIntensity: number
  backgroundColor: string
}

export default {}
