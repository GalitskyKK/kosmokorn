import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IUserData, IPlanetData, IPlanetEvent, IAppState } from "@/types"
import { cn } from "@/utils"
import Button from "@/components/ui/Button"
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

interface IEventsScreenProps {
  userData: IUserData | null
  planetData: IPlanetData | null
  onNavigate: (view: IAppState["currentView"]) => void
}

/**
 * Экран истории событий планеты
 * Показывает хронологию космических событий
 */
const EventsScreen: React.FC<IEventsScreenProps> = ({ userData, planetData, onNavigate }) => {
  const [selectedEvent, setSelectedEvent] = useState<IPlanetEvent | null>(null)
  const [filter, setFilter] = useState<"all" | "recent" | "major">("all")

  if (!userData || !planetData) {
    return null
  }

  // Фильтрация событий
  const filteredEvents = planetData.events
    .filter((event) => {
      switch (filter) {
        case "recent":
          return planetData.currentDay - event.day <= 7
        case "major":
          return ["comet", "asteroid", "volcanic", "solar_flare"].includes(event.type)
        default:
          return true
      }
    })
    .sort((a, b) => b.day - a.day) // Сортируем по убыванию дня

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  const getEventIcon = (type: string): string => {
    const icons = {
      comet: "☄️",
      solar_flare: "🌞",
      tectonic: "🌋",
      volcanic: "🌋",
      meteor: "💫",
      asteroid: "🪨",
      aurora: "🌌"
    }
    return icons[type as keyof typeof icons] || "⭐"
  }

  const getEventColor = (type: string): string => {
    const colors = {
      comet: "border-l-blue-500",
      solar_flare: "border-l-yellow-500",
      tectonic: "border-l-orange-500",
      volcanic: "border-l-red-500",
      meteor: "border-l-purple-500",
      asteroid: "border-l-gray-500",
      aurora: "border-l-green-500"
    }
    return colors[type as keyof typeof colors] || "border-l-blue-500"
  }

  return (
    <motion.div
      className="min-h-screen-mobile bg-gradient-to-br from-dark-500 via-dark-400 to-dark-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Заголовок */}
      <motion.header
        className="safe-top flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10"
        variants={itemVariants}>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate("planet")}
            className="text-white">
            ← Назад
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">История событий</h1>
            <p className="text-xs text-gray-400">{planetData.events.length} космических событий</p>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 p-4">
        {/* Фильтры */}
        <motion.div className="flex gap-2 mb-6 overflow-x-auto pb-2" variants={itemVariants}>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}>
            Все события ({planetData.events.length})
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === "recent"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}>
            Недавние ({planetData.events.filter((e) => planetData.currentDay - e.day <= 7).length})
          </button>
          <button
            onClick={() => setFilter("major")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === "major"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}>
            Крупные (
            {
              planetData.events.filter((e) =>
                ["comet", "asteroid", "volcanic", "solar_flare"].includes(e.type)
              ).length
            }
            )
          </button>
        </motion.div>

        {/* Список событий */}
        {filteredEvents.length === 0 ? (
          <motion.div className="text-center py-12" variants={itemVariants}>
            <div className="text-6xl mb-4">🌌</div>
            <h3 className="text-xl font-semibold text-white mb-2">События не найдены</h3>
            <p className="text-gray-400">
              {filter === "all"
                ? "Ваша планета еще молода. События начнут происходить с течением времени."
                : "Нет событий по выбранному фильтру."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <Card
                  variant="glassmorphism"
                  className={cn(
                    "border-l-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                    getEventColor(event.type)
                  )}
                  onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start gap-4 p-4">
                    <div className="text-2xl flex-shrink-0">{getEventIcon(event.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-white font-semibold text-sm mobile:text-base">
                            {event.title}
                          </h3>
                          <p className="text-gray-300 text-xs mobile:text-sm mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-400">День {event.day}</div>
                          <div className="text-xs text-blue-400">
                            {planetData.currentDay - event.day === 0
                              ? "Сегодня"
                              : planetData.currentDay - event.day === 1
                              ? "Вчера"
                              : `${planetData.currentDay - event.day} дней назад`}
                          </div>
                        </div>
                      </div>

                      {/* Влияние события */}
                      {Object.keys(event.impact).length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {Object.entries(event.impact).map(([key, value]) => (
                            <span
                              key={key}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                typeof value === "number" && value > 0
                                  ? "bg-green-900/50 text-green-300"
                                  : "bg-red-900/50 text-red-300"
                              )}>
                              {key}:{" "}
                              {typeof value === "number"
                                ? (value > 0 ? "+" : "") + value.toFixed(2)
                                : value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Детальный просмотр события */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}>
            <motion.div
              className="w-full max-w-lg max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}>
              <Card variant="glassmorphism" padding="lg">
                <CardHeader>
                  <div className="text-center">
                    <div className="text-6xl mb-4">{getEventIcon(selectedEvent.type)}</div>
                    <CardTitle className="text-white text-xl">{selectedEvent.title}</CardTitle>
                    <p className="text-gray-300 text-sm mt-2">
                      День {selectedEvent.day} • Продолжительность: {selectedEvent.duration} дней
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Описание */}
                    <div>
                      <h4 className="text-white font-semibold mb-2">Описание</h4>
                      <p className="text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                    </div>

                    {/* Влияние на планету */}
                    {Object.keys(selectedEvent.impact).length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">Влияние на планету</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedEvent.impact).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                              <span className="text-gray-300 capitalize">
                                {key === "temperature"
                                  ? "Температура"
                                  : key === "atmosphere"
                                  ? "Атмосфера"
                                  : key === "water"
                                  ? "Водные ресурсы"
                                  : key === "life"
                                  ? "Биосфера"
                                  : key === "radius"
                                  ? "Размер планеты"
                                  : key}
                              </span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  typeof value === "number" && value > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                )}>
                                {typeof value === "number"
                                  ? (value > 0 ? "+" : "") + value.toFixed(2)
                                  : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Статистика события */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400">Вероятность</div>
                        <div className="text-lg font-semibold text-white">
                          {Math.round(selectedEvent.probability * 100)}%
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400">Тип события</div>
                        <div className="text-lg font-semibold text-white capitalize">
                          {selectedEvent.type.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <Button onClick={() => setSelectedEvent(null)} variant="outline">
                      Закрыть
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default EventsScreen
