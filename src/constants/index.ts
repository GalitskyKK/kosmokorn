import { IPlanetGeneratorConfig, IStageRequirements, PlanetStage } from "@/types"

// Версия приложения и ключи для localStorage
export const APP_VERSION = "1.0.0"
export const STORAGE_KEY = "kosmokorn-data"

// Конфигурация генератора планет
export const PLANET_GENERATOR_CONFIG: IPlanetGeneratorConfig = {
  baseTemperature: 273, // Кельвины
  temperatureVariation: 200,
  atmosphereDensity: 0.5,
  waterProbability: 0.3,
  lifeProbability: 0.1,
  eventFrequency: 0.15,
  satelliteProbability: 0.25
}

// Требования для стадий эволюции
export const STAGE_REQUIREMENTS: Record<PlanetStage, IStageRequirements> = {
  seed: {
    minDays: 1
  },
  core: {
    minDays: 3,
    minTemperature: 200
  },
  atmosphere: {
    minDays: 7,
    minTemperature: 250,
    minAtmosphere: 0.2
  },
  surface: {
    minDays: 14,
    minTemperature: 200,
    maxTemperature: 400,
    minAtmosphere: 0.4,
    minWater: 0.1
  },
  life: {
    minDays: 30,
    minTemperature: 250,
    maxTemperature: 350,
    minAtmosphere: 0.6,
    minWater: 0.3,
    minLife: 0.1
  },
  mature: {
    minDays: 60,
    minTemperature: 280,
    maxTemperature: 320,
    minAtmosphere: 0.8,
    minWater: 0.5,
    minLife: 0.5
  }
}

// Названия и описания стадий
export const STAGE_INFO: Record<PlanetStage, { name: string; description: string; emoji: string }> =
  {
    seed: {
      name: "Семя",
      description: "Зарождение новой планеты в космической пыли",
      emoji: "🌱"
    },
    core: {
      name: "Ядро",
      description: "Формирование горячего планетарного ядра",
      emoji: "🔥"
    },
    atmosphere: {
      name: "Атмосфера",
      description: "Развитие первичной атмосферы",
      emoji: "🌫️"
    },
    surface: {
      name: "Поверхность",
      description: "Образование коры и первых океанов",
      emoji: "🌍"
    },
    life: {
      name: "Жизнь",
      description: "Появление первых форм жизни",
      emoji: "🦠"
    },
    mature: {
      name: "Зрелая планета",
      description: "Развитая экосистема с разнообразной жизнью",
      emoji: "🌎"
    }
  }

// Цветовые схемы для стадий - мягкие пастельные тона
export const STAGE_COLORS: Record<PlanetStage, string> = {
  seed: "#9CA3AF",
  core: "#F87171",
  atmosphere: "#FBBF24",
  surface: "#34D399",
  life: "#60A5FA",
  mature: "#A78BFA"
}

// Яркие контрастные цвета в стиле little-planet
export const STAGE_COLOR_GRADIENTS: Record<
  PlanetStage,
  { primary: string; secondary: string; accent: string }
> = {
  seed: {
    primary: "#8B4513", // Коричневый (земля)
    secondary: "#654321", // Тёмно-коричневый
    accent: "#D2691E" // Шоколадный
  },
  core: {
    primary: "#FF0000", // Ярко-красный (лава)
    secondary: "#FF4500", // Красно-оранжевый
    accent: "#FFD700" // Золотой
  },
  atmosphere: {
    primary: "#87CEEB", // Небесно-голубой
    secondary: "#4682B4", // Стальной синий
    accent: "#1E90FF" // Синий
  },
  surface: {
    primary: "#0066CC", // Океанский синий
    secondary: "#228B22", // Лесной зелёный
    accent: "#32CD32" // Лайм-зелёный
  },
  life: {
    primary: "#0066CC", // Океанский синий (вода)
    secondary: "#228B22", // Лесной зелёный (земля)
    accent: "#32CD32" // Лайм-зелёный (растения)
  },
  mature: {
    primary: "#0066CC", // Океанский синий (вода)
    secondary: "#228B22", // Лесной зелёный (земля)
    accent: "#32CD32" // Лайм-зелёный (растения)
  }
}

// Атмосферные цвета для облаков и эффектов
export const ATMOSPHERE_COLORS = {
  subtle: "rgba(173, 216, 230, 0.3)",
  medium: "rgba(173, 216, 230, 0.5)",
  dense: "rgba(173, 216, 230, 0.7)",
  storm: "rgba(119, 136, 153, 0.6)"
}

// Размеры планет по стадиям (относительные)
export const STAGE_SIZES: Record<PlanetStage, number> = {
  seed: 0.1,
  core: 0.3,
  atmosphere: 0.5,
  surface: 0.7,
  life: 0.9,
  mature: 1.0
}

// Вероятности событий по дням
export const EVENT_PROBABILITIES = {
  early: 0.1, // дни 1-7
  middle: 0.15, // дни 8-30
  late: 0.2 // дни 31+
}

// Названия событий
export const EVENT_NAMES = {
  comet: ["Комета Хейла-Боппа", "Комета Галлея", "Малая комета", "Ледяной странник"],
  solar_flare: ["Солнечная буря", "Магнитная буря", "Корональный выброс", "Солнечный ветер"],
  tectonic: ["Тектонический сдвиг", "Землетрясение", "Горообразование", "Разлом коры"],
  volcanic: ["Супервулкан", "Извержение вулкана", "Лавовые потоки", "Вулканическая зима"],
  meteor: ["Метеоритный дождь", "Астероид", "Космический камень", "Падающая звезда"],
  asteroid: ["Крупный астероид", "Каменный гигант", "Космическая глыба", "Железный астероид"],
  aurora: ["Северное сияние", "Магнитное свечение", "Плазменные танцы", "Световая завеса"]
}

// Конфигурация анимаций
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    medium: 0.5,
    slow: 1.0,
    evolution: 2.0
  },
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    elastic: [0.175, 0.885, 0.32, 1.275]
  }
}

// Настройки 3D сцены для мультяшного дизайна
export const SCENE_CONFIG = {
  camera: {
    position: [0, 0, 4] as [number, number, number],
    fov: 60, // Немного больше FOV для более дружелюбного вида
    near: 0.1,
    far: 1000
  },
  lights: {
    ambient: 0.8, // Очень мягкое освещение для мультяшного эффекта
    directional: 0.5, // Уменьшено для менее резких теней
    point: 0.4
  },
  controls: {
    enableZoom: true,
    enablePan: false,
    enableRotate: true,
    autoRotate: true,
    autoRotateSpeed: 0.3, // Ещё медленнее для спокойного вида
    minDistance: 50,
    maxDistance: 500
  },
  // Настройки для максимально блочной геометрии как в little-planet
  geometry: {
    detail: 0, // Минимальная детализация для блочного вида
    flatShading: true, // Плоское затенение для low-poly эффекта
    segments: 6, // Очень мало сегментов для maximum блочности
    surfaceDensity: 0.8, // Плотность объектов на поверхности
    continentCoverage: 0.4 // Покрытие континентами
  }
}

// Мобильные breakpoints
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
}

// Конфигурация PWA
export const PWA_CONFIG = {
  updateInterval: 1000 * 60 * 60, // 1 hour
  cachePrefix: "kosmokorn-v1",
  offlineMessage: "Приложение работает в оффлайн режиме"
}

// Достижения
export const ACHIEVEMENTS = {
  first_visit: {
    id: "first_visit",
    name: "Первый контакт",
    description: "Создал свою первую планету",
    icon: "🎯"
  },
  week_streak: {
    id: "week_streak",
    name: "Верный друг",
    description: "Посещал планету 7 дней подряд",
    icon: "🔥"
  },
  mature_planet: {
    id: "mature_planet",
    name: "Творец миров",
    description: "Вырастил зрелую планету",
    icon: "🏆"
  },
  event_collector: {
    id: "event_collector",
    name: "Свидетель чудес",
    description: "Наблюдал 10 космических событий",
    icon: "⭐"
  }
}

// Настройки по умолчанию
export const DEFAULT_SETTINGS = {
  enableSound: true,
  enableAnimations: true,
  theme: "space" as const,
  language: "ru" as const,
  notifications: true
}

// Сообщения для разных языков
export const MESSAGES = {
  ru: {
    welcome: "Добро пожаловать в KosmoKorn!",
    enterName: "Введите имя для вашей планеты",
    dailyVisit: "Ежедневный визит завершён!",
    newEvent: "Произошло космическое событие!",
    evolution: "Ваша планета эволюционировала!",
    error: "Произошла ошибка",
    loading: "Загрузка...",
    offline: "Оффлайн режим"
  },
  en: {
    welcome: "Welcome to KosmoKorn!",
    enterName: "Enter a name for your planet",
    dailyVisit: "Daily visit completed!",
    newEvent: "A cosmic event occurred!",
    evolution: "Your planet has evolved!",
    error: "An error occurred",
    loading: "Loading...",
    offline: "Offline mode"
  }
}

export default {
  APP_VERSION,
  STORAGE_KEY,
  PLANET_GENERATOR_CONFIG,
  STAGE_REQUIREMENTS,
  STAGE_INFO,
  STAGE_COLORS,
  STAGE_SIZES,
  EVENT_PROBABILITIES,
  EVENT_NAMES,
  ANIMATION_CONFIG,
  SCENE_CONFIG,
  BREAKPOINTS,
  PWA_CONFIG,
  ACHIEVEMENTS,
  DEFAULT_SETTINGS,
  MESSAGES
}
