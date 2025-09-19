import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IUserData, IPlanetData, IPlanetEvent, IAppState } from "@/types"
import { cn } from "@/utils"
import Button from "@/components/ui/Button"
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import {
  FiArrowLeft,
  FiChevronUp,
  FiChevronDown,
  FiHash,
  FiZap,
  FiGlobe,
  FiThermometer,
  FiSunrise,
  FiBox
} from "react-icons/fi"

interface IEventsScreenProps {
  userData: IUserData | null
  planetData: IPlanetData | null
  onNavigate: (view: IAppState["currentView"]) => void
}

const eventMeta = {
  comet: { icon: "☄️", color: "blue-500", label: "Комета" },
  solar_flare: { icon: "🌞", color: "yellow-500", label: "Вспышка" },
  tectonic: { icon: "🌋", color: "orange-500", label: "Тектоника" },
  volcanic: { icon: "🌋", color: "red-500", label: "Вулкан" },
  meteor: { icon: "💫", color: "purple-500", label: "Метеор" },
  asteroid: { icon: "🪨", color: "gray-500", label: "Астероид" },
  aurora: { icon: "🌌", color: "green-500", label: "Сияние" },
  default: { icon: "⭐", color: "gray-400", label: "Событие" }
}

const getEventMeta = (type: string) => {
  return eventMeta[type as keyof typeof eventMeta] || eventMeta.default
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

  return (
    <motion.div
      className="min-h-screen-mobile bg-gradient-to-br from-dark-500 via-dark-400 to-dark-300 text-gray-200"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Заголовок */}
      <motion.header
        className="safe-top sticky top-0 z-10 flex items-center justify-between p-4 bg-black/30 backdrop-blur-lg border-b border-white/10"
        variants={itemVariants}>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate("planet")}
            className="text-white hover:bg-white/10 flex items-center gap-2">
            <FiArrowLeft />
            <span>Назад</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">Лента событий</h1>
            <p className="text-xs text-gray-400">
              Записано {planetData.events.length} космических явлений
            </p>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 p-4">
        {/* Фильтры */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          variants={itemVariants}
          style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}>
            Все ({planetData.events.length})
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === "recent"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}>
            Недавние ({planetData.events.filter((e) => planetData.currentDay - e.day <= 7).length})
          </button>
          <button
            onClick={() => setFilter("major")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === "major"
                ? "bg-blue-600 text-white shadow-md"
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
                  variant="glass"
                  className={cn(
                    "border-l-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-white/5",
                    `border-${getEventMeta(event.type).color}`
                  )}
                  onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start gap-4 p-4">
                    <div className="text-3xl flex-shrink-0 mt-1">
                      {getEventMeta(event.type).icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-base sm:text-lg">
                            {event.title}
                          </h3>
                          <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-400">День {event.day}</div>
                          <div
                            className={cn(
                              "text-xs font-semibold",
                              planetData.currentDay - event.day === 0
                                ? "text-green-400"
                                : "text-blue-400"
                            )}>
                            {planetData.currentDay - event.day === 0
                              ? "Сегодня"
                              : planetData.currentDay - event.day === 1
                              ? "Вчера"
                              : `${planetData.currentDay - event.day} д. назад`}
                          </div>
                        </div>
                      </div>

                      {/* Влияние и тип события */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            `bg-${getEventMeta(event.type).color}/20 text-${
                              getEventMeta(event.type).color
                            }`
                          )}>
                          {getEventMeta(event.type).label}
                        </span>

                        {Object.entries(event.impact).map(([key, value]) => (
                          <span
                            key={key}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              typeof value === "number" && value > 0
                                ? "bg-green-900/50 text-green-300"
                                : "bg-red-900/50 text-red-300"
                            )}>
                            {typeof value === "number" && value > 0 ? (
                              <FiChevronUp className="w-3 h-3" />
                            ) : (
                              <FiChevronDown className="w-3 h-3" />
                            )}
                            <span>
                              {key}: {typeof value === "number" ? value.toFixed(2) : value}
                            </span>
                          </span>
                        ))}
                      </div>
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
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <div className="text-center">
                    <div className="text-6xl mb-4">{getEventMeta(selectedEvent.type).icon}</div>
                    <CardTitle className="text-white text-2xl">{selectedEvent.title}</CardTitle>
                    <p className="text-gray-300 text-sm mt-2">
                      День {selectedEvent.day} • Длительность: {selectedEvent.duration} д.
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Описание */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <FiBox /> Описание
                      </h4>
                      <p className="text-gray-300 leading-relaxed pl-6 border-l-2 border-white/10">
                        {selectedEvent.description}
                      </p>
                    </div>

                    {/* Влияние на планету */}
                    {Object.keys(selectedEvent.impact).length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <FiZap /> Влияние на планету
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(selectedEvent.impact).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                              <span className="text-gray-300 capitalize flex items-center gap-2">
                                {key === "temperature" ? <FiThermometer /> : <FiGlobe />}
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
                                  "font-semibold flex items-center gap-1",
                                  typeof value === "number" && value > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                )}>
                                {typeof value === "number" && value > 0 ? (
                                  <FiChevronUp />
                                ) : (
                                  <FiChevronDown />
                                )}
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
                        <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                          <FiHash /> Вероятность
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {Math.round(selectedEvent.probability * 100)}%
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                          <FiSunrise /> Тип события
                        </div>
                        <div className="text-lg font-semibold text-white capitalize">
                          {getEventMeta(selectedEvent.type).label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => setSelectedEvent(null)}
                      variant="outline"
                      className="hover:bg-white/10">
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
