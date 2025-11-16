// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.PHILOGIC_AI_URL = 'http://localhost:8001/api/chat'
process.env.PHILOGIC_AUTH_TOKEN = 'test-token-123'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()
