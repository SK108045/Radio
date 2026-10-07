import 'server-only'
import { mkdtemp, rm, readFile, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'
const run = promisify(execFile)
export async function makePreview(signedAudioUrl: string, fetcher: typeof fetch = fetch) {
  const dir = await mkdtemp(join(tmpdir(), 'rieng-preview-'))
  try {
    const input = join(dir, 'original'), output = join(dir, 'preview.mp3')
    const response = await fetcher(signedAudioUrl, { signal: AbortSignal.timeout(60000), cache: 'no-store' })
    if (!response.ok || !response.body) throw new Error('Audio could not be read from storage.')
    const length = Number(response.headers.get('content-length'))
    if (length > 50 * 1024 * 1024) throw new Error('Audio exceeds the 50 MB limit.')
    await pipeline(Readable.fromWeb(response.body as any), createWriteStream(input))
    if ((await stat(input)).size > 50 * 1024 * 1024) throw new Error('Audio exceeds the 50 MB limit.')
    const binary = process.env.FFMPEG_PATH || ffmpegPath
    if (!binary) throw new Error('Audio preview processing is not configured.')
    // Decode supported audio containers only. Reject playlists that reference
    // network resources or other server files, even when disguised as audio.
    await run(binary, ['-nostdin', '-hide_banner', '-loglevel', 'error', '-protocol_whitelist', 'file,pipe', '-format_whitelist', 'mp3,wav,mov,aac,ogg', '-i', input, '-t', '30', '-map', '0:a:0', '-vn', '-map_metadata', '-1', '-codec:a', 'libmp3lame', '-b:a', '96k', '-ar', '44100', '-y', output], { timeout: 90000, maxBuffer: 1024 * 1024 })
    return await readFile(output)
  } finally { await rm(dir, { recursive: true, force: true }) }
}
