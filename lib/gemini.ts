// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI Music Description Enhancement (gemini-3.1-flash-lite)
// Reliable IPv4 HTTPS Client
// ─────────────────────────────────────────────────────────────────────────────

import https from 'https'

interface EnhanceDescriptionParams {
  title: string
  artistName?: string
  rawDescription?: string
  genre?: string
}

function postGeminiHttps(apiKey: string, prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    })

    const options: https.RequestOptions = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      method: 'POST',
      family: 4, // Force IPv4 to prevent dual-stack ETIMEDOUT on Node 20
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 12000,
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const data = JSON.parse(body)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            resolve(text ? text.replace(/^["']|["']$/g, '') : null)
          } else {
            console.warn('Gemini API status:', res.statusCode, body)
            resolve(null)
          }
        } catch (e) {
          console.warn('Gemini response parse error:', e)
          resolve(null)
        }
      })
    })

    req.on('error', (err) => {
      console.warn('Gemini HTTPS error:', err.message)
      resolve(null)
    })

    req.on('timeout', () => {
      req.destroy()
      console.warn('Gemini request timeout')
      resolve(null)
    })

    req.write(postData)
    req.end()
  })
}

export async function enhanceTrackDescription({
  title,
  artistName = 'Kenyan Creator',
  rawDescription = '',
  genre = 'Kenyan Urban / Arbantone / Gengetone',
}: EnhanceDescriptionParams): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY || 'AQ.Ab8RN6LDJO6RH9quRTsyVo2TfRAX18Ijam7oNcgA8sxkG4NDLw'

  const prompt = `You are an expert music critic, sound engineer, and A&R curator for RIENG Radio in Nairobi, Kenya.
Write an authentic, punchy, high-energy 2 to 3 sentence music description for a new track on the RIENG Music Store.

Track Details:
- Title: "${title}"
- Artist / Producer: "${artistName}"
- Genre / Style: "${genre}"
- Artist Draft Notes: "${rawDescription.trim() || 'High energy street anthem with heavy 808s and Nairobi vibe'}"

Guidelines:
1. Capture the genuine Nairobi street vibe, Sheng energy, and audio production excellence (mention 808s, cadence, tempo, or club bounce).
2. Keep it engaging, professional, and ready for music fans to read before buying.
3. Output ONLY the 2-3 sentence description text. Do NOT include markdown headers, quotes, or conversational filler.`

  try {
    const aiText = await postGeminiHttps(apiKey, prompt)
    if (aiText && aiText.length > 20) {
      return aiText
    }
  } catch (err) {
    console.warn('AI enhancement fallback:', err)
  }

  // Fallback if network is completely offline
  return (
    rawDescription.trim() ||
    `${title} by ${artistName}. Exclusive high-energy drop mastered for the streets on RIENG Radio.`
  )
}
