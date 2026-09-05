import React from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock providers that might be needed for components
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const mockUser = {
  id: 'test-user-1',
  name: '测试用户',
  email: 'test@example.com',
  avatar: '/placeholder.svg',
  phone: '+86 138 0000 0000',
}

export const mockFriend = {
  id: 'friend-1',
  name: '好友用户',
  email: 'friend@example.com',
  avatar: '/placeholder.svg',
  phone: '+86 139 0000 0000',
  mutualFriends: 2,
}

export const createMockSearchResults = (count: number = 2) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `user${index + 1}`,
    name: `用户${index + 1}`,
    avatar: `/placeholder.svg?height=40&width=40&text=用户${index + 1}`,
    phone: `+86 138 000${index.toString().padStart(4, '0')}`,
    mutualFriends: Math.floor(Math.random() * 5),
  }))
}

export const createMockNearbyUsers = (count: number = 2) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `nearby${index + 1}`,
    name: `附近用户${index + 1}`,
    avatar: `/placeholder.svg?height=40&width=40&text=附近${index + 1}`,
    distance: `${50 + index * 70}米`,
  }))
}

export const createMockRecentContacts = (count: number = 2) => {
  const timeOptions = ['2天前', '1周前', '3天前', '5天前']
  return Array.from({ length: count }, (_, index) => ({
    id: `recent${index + 1}`,
    name: `最近联系${index + 1}`,
    avatar: `/placeholder.svg?height=40&width=40&text=最近${index + 1}`,
    lastContact: timeOptions[index % timeOptions.length],
  }))
}

import { vi } from 'vitest'

// Mock event handlers
export const createMockHandlers = () => ({
  onClose: vi.fn(),
  onAddFriend: vi.fn(),
  onSearch: vi.fn(),
  onClick: vi.fn(),
  onChange: vi.fn(),
  onSubmit: vi.fn(),
})

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Mock fetch
export const mockFetch = (response: any, ok: boolean = true) => {
  return vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  })
}

// Common assertions
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectToBeHidden = (element: HTMLElement | null) => {
  if (element) {
    expect(element).not.toBeVisible()
  } else {
    expect(element).not.toBeInTheDocument()
  }
}