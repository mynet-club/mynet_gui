import { describe, it, expect } from 'vitest'
import { createRouteDraft } from '../routeCreateDraft'

const setup = () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) }
  }
  return { draft: createRouteDraft(storage), storage }
}
const complete = (draft: ReturnType<typeof createRouteDraft>) => {
  draft.selectFriend({ id: 'friend-a', name: 'Alice' })
  draft.selectFriendNode({ id: 'target-a', name: 'Target' })
  draft.selectMyNode({ id: 'source-a', name: 'Source' })
  draft.saveMessage('Edited request message')
}

describe('connection wizard draft', () => {
  it('restores the selected chain and edited message on a new page instance', () => {
    const { draft, storage } = setup()
    complete(draft)
    const restored = createRouteDraft(storage).read()
    expect(restored.requiredStep).toBe(4)
    expect(restored.myNode?.id).toBe('source-a')
    expect(restored.message).toBe('Edited request message')
  })
  it('changing the friend clears both nodes and the old request message', () => {
    const { draft } = setup()
    complete(draft)
    draft.selectFriend({ id: 'friend-b' })
    expect(draft.read()).toMatchObject({ requiredStep: 2, friendNode: null, myNode: null, message: null })
  })
  it('changing the target preserves the friend but clears source and message', () => {
    const { draft } = setup()
    complete(draft)
    draft.selectFriendNode({ id: 'target-b' })
    expect(draft.read()).toMatchObject({ friend: { id: 'friend-a' }, requiredStep: 3, myNode: null, message: null })
  })
  it('changing the source invalidates the message built for the previous pair', () => {
    const { draft } = setup()
    complete(draft)
    draft.selectMyNode({ id: 'source-b' })
    expect(draft.read()).toMatchObject({ requiredStep: 4, myNode: { id: 'source-b' }, message: null })
  })
  it('revalidating the same selection updates metadata without losing dependent steps', () => {
    const { draft } = setup()
    complete(draft)
    draft.selectFriend({ id: 'friend-a', name: 'Renamed friend' })
    expect(draft.read().friend?.name).toBe('Renamed friend')
    expect(draft.read().message).toBe('Edited request message')
  })
  it('treats numeric and string versions of the same ID consistently', () => {
    const { draft } = setup()
    draft.selectFriend({ id: 123 })
    draft.selectFriendNode({ id: 'target-a' })
    draft.selectFriend({ id: '123' })
    expect(draft.read().friendNode?.id).toBe('target-a')
  })
  it.each(['{broken', 'null', '[]', '{"name":"missing id"}', '{"id":{}}', '{"id":""}'])('recovers from corrupt first-step storage: %s', raw => {
    const { draft, storage } = setup()
    complete(draft)
    storage.setItem('route-create-friend', raw)
    expect(draft.read()).toMatchObject({ requiredStep: 1, friend: null, friendNode: null, myNode: null, message: null })
  })
  it('a removed target returns to step 2 and clears the stale source', () => {
    const { draft } = setup()
    complete(draft)
    draft.selectFriendNode(null)
    expect(draft.read()).toMatchObject({ requiredStep: 2, friendNode: null, myNode: null })
  })
  it('preserves an intentionally empty message rather than replacing it with a default', () => {
    const { draft } = setup()
    complete(draft)
    draft.saveMessage('')
    expect(draft.read().message).toBe('')
  })
  it('clears the entire draft after submission', () => {
    const { draft } = setup()
    complete(draft)
    draft.reset()
    expect(draft.read()).toMatchObject({ requiredStep: 1, friend: null, message: null })
  })
})
