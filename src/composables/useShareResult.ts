import { trackGoal } from '../utils/analytics'

export async function shareResultImage(options: {
  imagePath: string
  fileName: string
  shareTitle: string
  shareText: string
}): Promise<'shared' | 'downloaded' | 'error'> {
  try {
    const response = await fetch(options.imagePath)
    if (!response.ok) throw new Error(`Не удалось загрузить ${options.imagePath}`)
    const blob = await response.blob()
    const file = new File([blob], options.fileName, { type: blob.type || 'image/png' })

    // Проверяем именно поддержку шеринга ФАЙЛОВ, не просто наличие navigator.share —
    // на десктопе navigator.share может существовать, но без поддержки files.
    const canShareFiles =
      typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

    if (canShareFiles && navigator.share) {
      await navigator.share({
        files: [file],
        title: options.shareTitle,
        text: options.shareText,
      })
      trackGoal('quiz_result_shared_native')
      return 'shared'
    }

    // Файлы не поддерживаются, но обычный текстовый шеринг может быть доступен —
    // тогда ссылка на share-страницу сама подтянет нужную картинку в превью.
    if (navigator.share) {
      try {
        await navigator.share({ title: options.shareTitle, text: options.shareText })
        trackGoal('quiz_result_shared_text_only')
        return 'shared'
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return 'error'
        // иначе просто проваливаемся в фолбэк ниже
      }
    }

    // Полный фолбэк (десктоп без Web Share API): скачиваем картинку + копируем
    // текст с уже вшитой ссылкой в буфер обмена.
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = options.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    try {
      await navigator.clipboard?.writeText(options.shareText)
    } catch {
      // буфер обмена может быть недоступен (нет разрешения/не https) — не критично
    }

    trackGoal('quiz_result_shared_fallback_download')
    return 'downloaded'
  } catch (err) {
    // AbortError — пользователь сам закрыл системное меню "Поделиться", это не ошибка
    if (err instanceof Error && err.name === 'AbortError') {
      return 'error'
    }
    console.error('Не удалось поделиться результатом:', err)
    trackGoal('quiz_result_share_failed')
    return 'error'
  }
}