// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI Music Description Enhancement (gemini-3.1-flash-lite)
// ─────────────────────────────────────────────────────────────────────────────

interface EnhanceDescriptionParams {
  title: string
  artistName?: string
  rawDescription?: string
  genre?: string
}

export async function enhanceTrackDescription({
  title,
  artistName = 'Kenyan Creator',
  rawDescription = '',
  genre = 'Kenyan Urban / Arbantone / Gengetone',
}: EnhanceDescriptionParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6LDJO6RH9quRTsyVo2TfRAX18Ijam7oNcgA8sxkG4NDLw'

  const prompt = `You are an expert music critic, sound engineer, and A&R curator for RIENG Radio in Nairobi, Kenya.
Write an authentic, punchy, high-energy 2 to 3 sentence music description for a new track on the RIENG Music Store.

Track Details:
- Title: "${title}"
- Artist / Producer: "${artistName}"
- Genre / Style: "${genre}"
- Artist Draft Notes: "${rawDescription.trim() || 'High energy street anthem with heavy beats'}"

Guidelines:
1. Capture the genuine Nairobi street vibe, Sheng energy, and audio production excellence (mention 808s, cadence, tempo, or club bounce).
2. Keep it engaging, professional, and ready for music fans to read before buying.
3. Output ONLY the 2-3 sentence description text. Do NOT include markdown headers, quotes, or conversational filler.`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errBody = await res.text()
      console.warn('Gemini API returned error status:', res.status, errBody)
      return rawDescription.trim() || `${title} by ${artistName}. Exclusive Kenyan release on RIENG Radio.`
    }

    const data = await res.json()
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (candidateText) {
      return candidateText.replace(/^["']|["']$/g, '')
    }

    return rawDescription.trim() || `${title} by ${artistName}. Produced and mastered for the streets.`
  } catch (error) {
    console.warn('Gemini AI enhancement notice, using draft/fallback:', error)
    return rawDescription.trim() || `${title} by ${artistName}. Exclusive high-energy drop on the RIENG Store.`
  }
}
