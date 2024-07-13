import { matchStrings } from '@renderer/components/Editor/Subtitles/SubtitleList/SubtitleList.utils'
import { Project } from '@renderer/store/store'

class IndexedDBService {
  private dbName: string
  private dbVersion: number
  private db: IDBDatabase | null = null

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName
    this.dbVersion = dbVersion
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('projectsStore')) {
          const store = db.createObjectStore('projectsStore', { keyPath: 'id' })
          store.createIndex('id', 'id', { unique: true })
        }
      }

      request.onsuccess = (): void => {
        this.db = request.result
        resolve(this.db)
      }

      request.onerror = (): void => {
        reject(request.error)
      }
    })
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db)
    }
    return this.openDB()
  }

  public async addProject(data: Project): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('projectsStore', 'readwrite')
      const store = transaction.objectStore('projectsStore')
      const request = store.add(data)

      request.onsuccess = (): void => resolve()
      request.onerror = (): void => reject(request.error)
    })
  }

  public async getProject(key: IDBValidKey): Promise<Project> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('projectsStore', 'readonly')
      const store = transaction.objectStore('projectsStore')
      const request = store.get(key)

      request.onsuccess = (): void => resolve(request.result)
      request.onerror = (): void => reject(request.error)
    })
  }

  public async getProjects(
    pageNumber: number,
    limit: number,
    searchFilter: string
  ): Promise<Project[]> {
    const offset = (pageNumber - 1) * limit
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('projectsStore', 'readonly')
      const store = transaction.objectStore('projectsStore')
      const request = store.index('id').openCursor(null, 'prev')
      const results: Project[] = []
      let count = 0

      request.onsuccess = (event): void => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          if (
            count >= offset &&
            results.length < limit &&
            matchStrings(cursor.value.name, searchFilter)
          ) {
            results.push(cursor.value)
          }
          count++
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = (): void => reject(request.error)
    })
  }

  public async updateProject(data: Project): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('projectsStore', 'readwrite')
      const store = transaction.objectStore('projectsStore')
      const request = store.put(data)

      request.onsuccess = (): void => resolve()
      request.onerror = (): void => reject(request.error)
    })
  }

  public async deleteProject(key: IDBValidKey): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('projectsStore', 'readwrite')
      const store = transaction.objectStore('projectsStore')
      const request = store.delete(key)

      request.onsuccess = (): void => resolve()
      request.onerror = (): void => reject(request.error)
    })
  }

  public async getProjectsCount(searchFilter: string): Promise<number> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('projectsStore', 'readonly')
      const store = transaction.objectStore('projectsStore')

      let count = 0

      // Open cursor to iterate over all records
      store.openCursor().onsuccess = (event): void => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          if (matchStrings(cursor.value.name, searchFilter)) {
            count++
          }
          cursor.continue()
        } else {
          resolve(count)
        }
      }

      transaction.onerror = (): void => {
        reject(transaction.error)
      }
    })
  }
}

const indexedDBService = new IndexedDBService('subtifyDatabase', 1)

export default indexedDBService
