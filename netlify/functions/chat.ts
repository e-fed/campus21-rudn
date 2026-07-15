import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { CAMPUS_FACTS_TEXT } from '../../src/data/campusFacts'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) }
  }

  const origin = event.headers.origin || event.headers.referer || ''
  if (!origin.includes('localhost') && !origin.includes('netlify.app') && !origin.includes('rudn.ru')) {
    return { statusCode: 403, body: JSON.stringify({ error: 'forbidden' }) }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GROQ_API_KEY не задан на сервере' }) }
  }

  let body: { message?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad json' }) }
  }

  const message = (body.message ?? '').toString().trim().slice(0, 1000)
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'empty message' }) }
  }

  const history = Array.isArray(body.history) ? body.history.slice(-4) : []

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 250,
        messages: [
          { role: 'system', content: CAMPUS_FACTS_TEXT },
          ...history,
          { role: 'user', content: message },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq API error:', groqRes.status, errText)
      
      if (groqRes.status === 429) {
        const retryAfter = groqRes.headers.get('retry-after') || '5'
        return {
          statusCode: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': retryAfter },
          body: JSON.stringify({ error: 'rate_limited', retryAfter: Number(retryAfter) }),
        }
      }
      
      return { statusCode: 502, body: JSON.stringify({ error: 'upstream error' }) }
    }

    const data = await groqRes.json()
    const answer: string = data?.choices?.[0]?.message?.content ?? ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    }
  } catch (err: any) {
    console.error('Chat proxy failed:', err)
    if (err.name === 'TimeoutError') {
      return { statusCode: 504, body: JSON.stringify({ error: 'gateway timeout' }) }
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'internal error' }) }
  }
}