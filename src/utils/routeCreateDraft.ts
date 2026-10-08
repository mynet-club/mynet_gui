// Session-only wizard state. Changing a prerequisite invalidates dependent steps.
export interface RouteSelection {
  id: string | number
  name?: string
}

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
const keys = ['route-create-friend', 'route-create-friend-node', 'route-create-my-node', 'route-create-message'] as const

const parseSelection = (raw: string | null): RouteSelection | null => {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    if (!value || Array.isArray(value) || typeof value !== 'object') return null
    const id = value.id
    return (typeof id === 'string' && id.trim() !== '') || (typeof id === 'number' && Number.isFinite(id))
      ? value : null
  } catch { return null }
}

export const createRouteDraft = (storage: DraftStorage) => {
  const clearFrom = (index: number) => keys.slice(index).forEach(key => storage.removeItem(key))
  const read = () => {
    const selections = keys.slice(0, 3).map(key => parseSelection(storage.getItem(key)))
    const missing = selections.findIndex(value => !value)
    if (missing !== -1) {
      clearFrom(missing)
      selections.fill(null, missing)
    }
    return {
      friend: selections[0] ?? null,
      friendNode: selections[1] ?? null,
      myNode: selections[2] ?? null,
      message: storage.getItem(keys[3]),
      requiredStep: missing === -1 ? 4 : missing + 1
    }
  }
  const select = (index: 0 | 1 | 2, value: RouteSelection | null) => {
    const previous = parseSelection(storage.getItem(keys[index]))
    if (!value) { clearFrom(index); return }
    if (!previous || String(previous.id) !== String(value.id)) clearFrom(index + 1)
    storage.setItem(keys[index], JSON.stringify(value))
  }
  return {
    read,
    selectFriend: (value: RouteSelection | null) => select(0, value),
    selectFriendNode: (value: RouteSelection | null) => select(1, value),
    selectMyNode: (value: RouteSelection | null) => select(2, value),
    saveMessage: (message: string) => storage.setItem(keys[3], message),
    reset: () => clearFrom(0)
  }
}
