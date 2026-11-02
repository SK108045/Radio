import { SHOW_SCHEDULE } from '@/lib/showSchedule'

export type ShowDetails = { title: string; host: string; image: string }

export function getCurrentShow(_day: number, hour: number, minute = 0): ShowDetails {
  const minuteOfDay = hour * 60 + minute
  const show = SHOW_SCHEDULE.find(
    (item) => minuteOfDay >= item.startMinute && minuteOfDay < item.endMinute,
  )

  if (!show) {
    return { title: 'RIENG', host: 'RIENG', image: '/Rieng_Radio.jpg' }
  }

  return {
    title: show.title,
    host: show.host,
    image: show.image,
  }
}
