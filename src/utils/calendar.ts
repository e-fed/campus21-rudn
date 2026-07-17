// Генерирует .ics файл для скачивания "добавить в календарь" — без бэкенда, чисто на клиенте.
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function downloadStartDateIcs() {
  const start = new Date('2026-11-18T09:00:00+03:00')
  const end = new Date('2026-11-18T11:00:00+03:00')
  const now = new Date()

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus21 RUDN//Registration//RU',
    'BEGIN:VEVENT',
    `UID:campus21-rudn-start-${now.getTime()}@rudn.ru`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    'SUMMARY:Старт обучения — Кампус РУДН × Школа 21',
    'DESCRIPTION:Начало основного обучения по программам «ИИ-инженер» и «Цифровой заказчик».',
    'LOCATION:г. Москва\\, ул. Подольское шоссе\\, д. 8',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Завтра старт обучения в Кампусе РУДН × Школа 21',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'campus21-rudn-start.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}