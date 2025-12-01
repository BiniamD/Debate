// Storage interface for the Debate application
// Currently no persistent storage needed for MVP
// Future: Add debate history storage

export interface IStorage {
  // Placeholder for future storage needs
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize in-memory storage
  }
}

export const storage = new MemStorage();
