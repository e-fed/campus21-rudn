import { ref, provide, inject } from 'vue'

export type TrackId = 'duck' | 'turtle' | null

const riverState = ref<{
  selectedTrack: TrackId
  quizCompleted: boolean
}>({
  selectedTrack: null,
  quizCompleted: false
})

export function provideRiverState() {
  provide('riverState', riverState)
  return riverState
}

export function useRiverState() {
  const state = inject<typeof riverState>('riverState')
  if (!state) {
    throw new Error('River state not provided')
  }
  return state
}