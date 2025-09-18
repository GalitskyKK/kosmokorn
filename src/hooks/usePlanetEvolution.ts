import { useState, useEffect, useMemo, useCallback } from "react"
import { IPlanetData, IUsePlanetEvolution } from "@/types"
import { PlanetGenerator } from "@/services/planetGenerator"

/**
 * Хук для управления эволюцией планеты
 * Обеспечивает детерминированную генерацию данных планеты на основе seed
 */
export const usePlanetEvolution = (seed: string, currentDay: number): IUsePlanetEvolution => {
  const [planetData, setPlanetData] = useState<IPlanetData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Мемоизируем генератор планет
  const generator = useMemo(() => {
    if (!seed) return null
    return new PlanetGenerator(seed)
  }, [seed])

  // Генерирует данные планеты для текущего дня
  const generatePlanetData = useCallback(
    async (day: number): Promise<IPlanetData | null> => {
      if (!generator) {
        setError("Генератор планет не инициализирован")
        return null
      }

      try {
        setIsLoading(true)
        setError(null)

        // Используем setTimeout для имитации асинхронной работы
        // и предоставления возможности обновления UI
        return await new Promise<IPlanetData>((resolve) => {
          setTimeout(() => {
            const data = generator.generatePlanetData(day)
            resolve(data)
          }, 100)
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка"
        setError(`Ошибка генерации планеты: ${errorMessage}`)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [generator]
  )

  // Запускает эволюцию планеты
  const triggerEvolution = useCallback(async (): Promise<void> => {
    const newData = await generatePlanetData(currentDay)
    if (newData) {
      setPlanetData(newData)
    }
  }, [generatePlanetData, currentDay])

  // Сбрасывает планету к начальному состоянию
  const resetPlanet = useCallback(async (): Promise<void> => {
    const newData = await generatePlanetData(1)
    if (newData) {
      setPlanetData(newData)
    }
  }, [generatePlanetData])

  // Эффект для автоматической генерации при изменении дня или seed
  useEffect(() => {
    if (!seed || currentDay < 1) {
      setPlanetData(null)
      setIsLoading(false)
      return
    }

    let isCancelled = false

    const loadPlanetData = async (): Promise<void> => {
      const data = await generatePlanetData(currentDay)
      if (!isCancelled && data) {
        setPlanetData(data)
      }
    }

    loadPlanetData()

    return () => {
      isCancelled = true
    }
  }, [seed, currentDay, generatePlanetData])

  return {
    planetData,
    isLoading,
    error,
    triggerEvolution,
    resetPlanet
  }
}

/**
 * Хук для получения истории эволюции планеты
 * Возвращает данные планеты за все дни до текущего
 */
export const usePlanetHistory = (seed: string, currentDay: number) => {
  const [history, setHistory] = useState<IPlanetData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const generator = useMemo(() => {
    if (!seed) return null
    return new PlanetGenerator(seed)
  }, [seed])

  const loadHistory = useCallback(async (): Promise<void> => {
    if (!generator || currentDay < 1) return

    try {
      setIsLoading(true)
      setError(null)

      const historyData: IPlanetData[] = []

      // Генерируем данные для всех дней
      for (let day = 1; day <= currentDay; day++) {
        const planetData = generator.generatePlanetData(day)
        historyData.push(planetData)
      }

      setHistory(historyData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки истории"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [generator, currentDay])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    history,
    isLoading,
    error,
    reloadHistory: loadHistory
  }
}

/**
 * Хук для получения статистики эволюции планеты
 */
export const usePlanetStats = (planetData: IPlanetData | null) => {
  const stats = useMemo(() => {
    if (!planetData) {
      return {
        totalEvents: 0,
        totalLifeforms: 0,
        totalSatellites: 0,
        evolutionLevel: 0,
        averageTemperature: 0,
        habitabilityScore: 0
      }
    }

    const habitabilityScore = calculateHabitabilityScore(planetData)

    return {
      totalEvents: planetData.events.length,
      totalLifeforms: planetData.lifeforms.length,
      totalSatellites: planetData.satellites.length,
      evolutionLevel: planetData.evolution.evolutionPoints,
      averageTemperature: planetData.temperature,
      habitabilityScore
    }
  }, [planetData])

  return stats
}

/**
 * Рассчитывает индекс пригодности планеты для жизни
 */
function calculateHabitabilityScore(planetData: IPlanetData): number {
  const { temperature, atmosphere, water, life } = planetData

  // Идеальные условия для жизни
  const idealTemp = 288 // ~15°C
  const tempScore = Math.max(0, 1 - Math.abs(temperature - idealTemp) / 100)

  // Чем больше атмосферы, воды и жизни, тем лучше
  const atmosphereScore = Math.min(1, atmosphere)
  const waterScore = Math.min(1, water)
  const lifeScore = Math.min(1, life)

  // Средневзвешенная оценка
  const totalScore = tempScore * 0.3 + atmosphereScore * 0.25 + waterScore * 0.25 + lifeScore * 0.2

  return Math.round(totalScore * 100)
}

export default usePlanetEvolution
