import { IStorageData } from "@/types"
import { STORAGE_KEY, APP_VERSION } from "@/constants"

/**
 * Сервис для работы с localStorage
 * Обеспечивает безопасное сохранение и загрузку данных пользователя
 */
export class StorageService {
  private static readonly STORAGE_KEY = STORAGE_KEY

  /**
   * Сохраняет данные в localStorage
   */
  static save(data: IStorageData): boolean {
    try {
      const serializedData = JSON.stringify(data)
      localStorage.setItem(this.STORAGE_KEY, serializedData)
      return true
    } catch (error) {
      console.error("Ошибка сохранения данных:", error)
      return false
    }
  }

  /**
   * Загружает данные из localStorage
   */
  static load(): IStorageData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return null

      const parsedData: IStorageData = JSON.parse(data)

      // Проверка версии данных
      if (parsedData.version !== APP_VERSION) {
        console.log("Обнаружена старая версия данных, выполняется миграция")
        return this.migrateData(parsedData)
      }

      return parsedData
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
      return null
    }
  }

  /**
   * Очищает данные из localStorage
   */
  static clear(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error("Ошибка очистки данных:", error)
      return false
    }
  }

  /**
   * Проверяет наличие данных в localStorage
   */
  static hasData(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null
  }

  /**
   * Получает размер данных в localStorage
   */
  static getStorageSize(): number {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? new Blob([data]).size : 0
    } catch {
      return 0
    }
  }

  /**
   * Создает резервную копию данных
   */
  static createBackup(): string | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return null

      const backup = {
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        data: JSON.parse(data)
      }

      return JSON.stringify(backup)
    } catch (error) {
      console.error("Ошибка создания резервной копии:", error)
      return null
    }
  }

  /**
   * Восстанавливает данные из резервной копии
   */
  static restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData)

      if (!backup.data || !backup.version) {
        throw new Error("Неверный формат резервной копии")
      }

      return this.save(backup.data)
    } catch (error) {
      console.error("Ошибка восстановления из резервной копии:", error)
      return false
    }
  }

  /**
   * Миграция данных между версиями
   */
  private static migrateData(oldData: any): IStorageData | null {
    try {
      // Базовая структура для новой версии
      const migratedData: IStorageData = {
        userData: {
          seed: oldData.userData?.seed || "",
          planetName: oldData.userData?.planetName || "Новая планета",
          currentDay: oldData.userData?.currentDay || 1,
          lastVisit: new Date(oldData.userData?.lastVisit || Date.now()),
          totalVisits: oldData.userData?.totalVisits || 1,
          achievements: oldData.userData?.achievements || [],
          settings: {
            enableSound: true,
            enableAnimations: true,
            theme: "space",
            language: "ru",
            notifications: true,
            ...oldData.userData?.settings
          }
        },
        planetData: oldData.planetData || null,
        eventHistory: oldData.eventHistory || [],
        version: APP_VERSION
      }

      this.save(migratedData)
      return migratedData
    } catch (error) {
      console.error("Ошибка миграции данных:", error)
      return null
    }
  }

  /**
   * Проверяет целостность данных
   */
  static validateData(data: IStorageData): boolean {
    try {
      const isValid =
        data &&
        data.version &&
        data.userData &&
        data.userData.seed &&
        data.userData.planetName &&
        typeof data.userData.currentDay === "number" &&
        Array.isArray(data.eventHistory)
      return Boolean(isValid)
    } catch {
      return false
    }
  }

  /**
   * Экспорт данных для шаринга
   */
  static exportPlanetData(): string | null {
    try {
      const data = this.load()
      if (!data) return null

      const exportData = {
        planetName: data.userData.planetName,
        seed: data.userData.seed,
        currentDay: data.userData.currentDay,
        stage: data.planetData?.stage,
        eventCount: data.eventHistory.length,
        exportedAt: new Date().toISOString()
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error("Ошибка экспорта данных:", error)
      return null
    }
  }
}

/**
 * Хелперы для быстрого доступа к часто используемым операциям
 */
export const storage = {
  save: StorageService.save,
  load: StorageService.load,
  clear: StorageService.clear,
  hasData: StorageService.hasData,
  backup: StorageService.createBackup,
  restore: StorageService.restoreFromBackup,
  export: StorageService.exportPlanetData
}

export default StorageService
