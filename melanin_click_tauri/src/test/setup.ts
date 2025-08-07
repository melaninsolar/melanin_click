import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Tauri API for testing
const mockTauri = {
  tauri: {
    invoke: vi.fn(),
  },
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
  window: {
    appWindow: {
      minimize: vi.fn(),
      close: vi.fn(),
    },
  },
}

// @ts-ignore
global.__TAURI__ = mockTauri

// Mock environment variables
Object.defineProperty(window, 'location', {
  value: {
    origin: 'tauri://localhost',
  },
  writable: true,
})