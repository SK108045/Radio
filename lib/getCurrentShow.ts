export type ShowDetails = { title: string; host: string; image: string };

const KENYAN_OLD_SCHOOL_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/KenyanOldSchool.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0tlbnlhbk9sZFNjaG9vbC5qcGciLCJpYXQiOjE3Nzg5MzAyNzUsImV4cCI6MTgxMDQ2NjI3NX0.TEdCSlJa-nq45lHd_sk5oE85kEQiyZqEBzi9OVBs-As';
const GENGETONE_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gengetone2.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dlbmdldG9uZTIuanBnIiwiaWF0IjoxNzc5MjcxMjcxLCJleHAiOjE4MTA4MDcyNzF9.8g2lcsHxZHP3zTn1nnGaS7WDdO51ILslPaQA_t8O5IM';
const REGGAE_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/InkMatik.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvSW5rTWF0aWsuanBnIiwiaWF0IjoxNzc4ODYyNTY3LCJleHAiOjE4MTAzOTg1Njd9.PGiJ15a-fGAhA8e0v2HZwnkVIP2jBx4KSrWiPuwX-fA';
const UNDERGROUND_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTgyNiwiZXhwIjoxODEwNDY1ODI2fQ.muNTHcXGPd11AeyNwz5C5TszbS1xWJO1Gb9Ib5496ag';
const RNB_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1JuQi5qcGciLCJpYXQiOjE3NzkyNjcwMzYsImV4cCI6MTgxMDgwMzAzNn0.1n19oWoG6A-EDrXaILLNof75PFG_mg7iLSLI7_aAl9I';
const DAILY_GOSPEL_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzc2MTg2OTAsImV4cCI6MTgwOTE1NDY5MH0.FiCgYciSVoTbmjsZ039KJG8_hlbPa18hY7rl10hUzrw';

const BONGO_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/Bongo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL0JvbmdvLmpwZyIsImlhdCI6MTc3OTc4NDg1MSwiZXhwIjoxODExMzIwODUxfQ.hVJe2v5lmbwmb3BwiaCHyD5L0y4eVNlv2YmHEo5to7g';
const NAIJA_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/Naija.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL05haWphLmpwZyIsImlhdCI6MTc3OTc4NTQyNiwiZXhwIjoxODExMzIxNDI2fQ.a3GJb0qDEkC5w6IGHY5ItCGB03PTaAKwzIZ-NUzb9Ec';
const AMAPIANO_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/Ampiano.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL0FtcGlhbm8uanBnIiwiaWF0IjoxNzc5Nzg0ODYzLCJleHAiOjE4MTEzMjA4NjN9.Gv_a67BXe_-vKhi0-Gu1EDhvy7ec2xMb8YbG-KC_eHw';
const LINGALA_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/Lingala.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL0xpbmdhbGEuanBnIiwiaWF0IjoxNzc5Nzg1NDkzLCJleHAiOjE4MTEzMjE0OTN9.R0QtH6HYpjOtGFJwV9ND8ve4xOYD3J6-6DDXyYtmDjs';
const GOSPEL_WORSHIP_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzk3ODYxNDYsImV4cCI6MTgxMTMyMjE0Nn0.6EtVIW4mzntmzejfQxDySoddqdQjQ4gR7I_-7jxluqg';
const US_RNB_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/US_RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL1VTX1JuQi5qcGciLCJpYXQiOjE3Nzk3ODU5NTMsImV4cCI6MTgxMTMyMTk1M30.Q-eNIt5VPJquyzv9qufEUlnOhtywWVF-YiyAD4eqElQ';
const US_HIPHOP_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/US_HipHop.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL1VTX0hpcEhvcC5qcGciLCJpYXQiOjE3Nzk3ODYyMzQsImV4cCI6MTgxMTMyMjIzNH0.7MVsXgaAO9xv5rtNh023kqxgCwmbbUBuZmPok4LxuTQ';
const NEW_KENYAN_MUSIC_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/WeekendShows/New_Kenyan_Music.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvV2Vla2VuZFNob3dzL05ld19LZW55YW5fTXVzaWMuanBnIiwiaWF0IjoxNzc5Nzg0OTExLCJleHAiOjE4MTEzMjA5MTF9.9GRhk0jBuT8Ybb-hL8uAdZuiC6rLGhj0maEjaHFuLE8';
const SPORTS_IMG = '/Bura.jpg';
const POLITICS_IMG = 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Politics.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1BvbGl0aWNzLmpwZyIsImlhdCI6MTc3OTQ1NjgwOSwiZXhwIjoxODEwOTkyODA5fQ.cL7be6KjlWm1cMDWqElTql568ju6o8GznaYZvAAim8o';

export function getCurrentShow(day: number, hour: number): ShowDetails {
  if (day >= 1 && day <= 5) {
    if (hour >= 5 && hour < 10) return { title: 'Kenyan Old School', host: 'Muthoni Kenya', image: KENYAN_OLD_SCHOOL_IMG };
    if (hour >= 10 && hour < 15) return { title: 'Gengetone / Arbantone', host: 'Kartelo', image: GENGETONE_IMG };
    if (hour >= 15 && hour < 19) return { title: 'Reggae / Dancehall', host: 'inkmatic', image: REGGAE_IMG };
    if (hour >= 19 && hour < 23) return { title: 'Underground Kenyan HipHop', host: 'Joy Ohon', image: UNDERGROUND_IMG };
    if (hour >= 23 || hour < 3) return { title: 'Kenyan RnB', host: 'Modesto', image: RNB_IMG };
    return { title: 'Gospel Kenya', host: 'RIENG Radio', image: DAILY_GOSPEL_IMG };
  } else if (day === 6) {
    if (hour >= 8 && hour < 12) return { title: 'SPORTS SHOW', host: 'Bura & Swat', image: SPORTS_IMG };
    if (hour >= 12 && hour < 13) return { title: 'POLITICS SHOW', host: 'Panel', image: POLITICS_IMG };
    if (hour >= 13 && hour < 15) return { title: 'Bongo', host: 'RIENG Radio', image: BONGO_IMG };
    if (hour >= 15 && hour < 17) return { title: 'Naija', host: 'RIENG Radio', image: NAIJA_IMG };
    if (hour >= 17 && hour < 19) return { title: 'Amapiano', host: 'RIENG Radio', image: AMAPIANO_IMG };
    if (hour >= 19 && hour < 21) return { title: 'Lingala', host: 'RIENG Radio', image: LINGALA_IMG };
    if (hour >= 21 || hour < 3) return { title: 'Underground Kenyan HipHop', host: 'Joy Ohon', image: UNDERGROUND_IMG };
    return { title: 'Gospel Kenya', host: 'RIENG Radio', image: DAILY_GOSPEL_IMG };
  } else {
    // Sunday
    if (hour >= 5 && hour < 7) return { title: 'Gospel / Worship', host: 'RIENG Radio', image: GOSPEL_WORSHIP_IMG };
    if (hour >= 13 && hour < 15) return { title: 'US R&B', host: 'RIENG Radio', image: US_RNB_IMG };
    if (hour >= 15 && hour < 19) return { title: 'US Hip-Hop', host: 'RIENG Radio', image: US_HIPHOP_IMG };
    if (hour >= 19 && hour < 21) return { title: 'New Kenyan Music', host: 'RIENG Radio', image: NEW_KENYAN_MUSIC_IMG };
    return { title: 'Gospel Kenya', host: 'RIENG Radio', image: DAILY_GOSPEL_IMG };
  }
}
