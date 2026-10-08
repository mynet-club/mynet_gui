import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '../../services/api'
import { useOnboardingStore } from '../onboarding'
import { OnboardingStage } from '../../types/tips'
vi.mock('../../services/api', () => ({ api: { get: vi.fn(async () => ({ data: {} })), put: vi.fn(async () => ({})) } }))
describe('device first onboarding', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(api.get).mockResolvedValue({ data: {} } as never)
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() })
    setActivePinia(createPinia())
  })
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals() })
  it('offers device creation without welcome or pool prerequisites', () => {
    const store = useOnboardingStore()
    expect(store.nextStage).toBe(OnboardingStage.AddFirstDevice)
    store.completeStage(OnboardingStage.AddFirstDevice)
    expect(store.nextStage).toBeNull()
  })
  it('recovers device milestones from inventory without changing preferences', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => ({ data: url === '/nodes'
      ? { data: { nodes: { total: 2 } } }
      : { data: { stages: { welcome_shown: true }, preferences: { skipAll: true } } }
    }) as never)
    const store = useOnboardingStore()
    await store.initialize('42')
    expect(store.stages.first_device_added).toBe(true)
    expect(store.stages.second_device_added).toBe(true)
    expect(store.preferences.skipAll).toBe(true)
    expect(store.preferences.allowRestart).toBe(true)
  })
  it('does not require welcome and manually created pool to finish', () => {
    const store = useOnboardingStore()
    store.completeStage(OnboardingStage.AddFirstDevice)
    store.completeStage(OnboardingStage.ManageConnections)
    expect(store.completed).toBe(true)
    expect(store.progress).toBe(100)
    expect(store.stages.welcome_shown).toBe(false)
    expect(store.stages.first_ippool_created).toBe(false)
  })
  it('does not classify an existing account without onboarding history as new', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => ({ data: url === '/nodes'
      ? { data: { nodes: { total: 13 } } } : {} }) as never)
    const store = useOnboardingStore()
    await store.initialize('existing-user')
    expect(store.deviceCount).toBe(13)
    expect(store.canOfferFirstDevice).toBe(false)
    expect(store.stages.first_device_added).toBe(true)
  })
  it('offers optional creation only after a confirmed empty inventory', async () => {
    const store = useOnboardingStore()
    expect(store.canOfferFirstDevice).toBe(false)
    vi.mocked(api.get).mockImplementation(async (url) => ({ data: url === '/nodes'
      ? { data: { nodes: { total: 0 } } } : {} }) as never)
    await store.initialize('empty-user')
    expect(store.canOfferFirstDevice).toBe(true)
    store.skipAll()
    expect(store.canOfferFirstDevice).toBe(false)
  })
  it('does not treat an inventory failure as an empty account', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('temporary failure'))
    const store = useOnboardingStore()
    await store.initialize('unknown-user')
    expect(store.deviceCount).toBeNull()
    expect(store.canOfferFirstDevice).toBe(false)
  })

})
