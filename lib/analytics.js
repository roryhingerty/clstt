import { PostHog } from 'posthog-react-native'

const POSTHOG_API_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY ??
  process.env.POSTHOG_API_KEY ??
  ''

let client = null

function getClient() {
  if (client) return client
  if (!POSTHOG_API_KEY) return null

  client = new PostHog(POSTHOG_API_KEY, {
    host: 'https://app.posthog.com',
  })
  return client
}

export const analytics = {
  identify(distinctId, props) {
    const c = getClient()
    if (!c || !distinctId) return
    c.identify(distinctId, props)
  },
  track(event, props) {
    const c = getClient()
    if (!c || !event) return
    c.capture(event, props)
  },
  reset() {
    const c = getClient()
    if (!c) return
    c.reset()
  },
}

