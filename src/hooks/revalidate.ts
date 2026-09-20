import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Trang public được dựng tĩnh, nên khi CMS lưu phải dựng lại đúng trang đó.
 * Hàm này cũng chạy trong CLI (migrate, seed) nơi không có ngữ cảnh request,
 * vì vậy bọc try/catch để không làm hỏng thao tác lưu.
 */
const safeRevalidate = (paths: string[]) => {
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch {
      // Ngoài ngữ cảnh Next thì bỏ qua
    }
  }
}

const pathsForPage = (slug?: string | null) => {
  if (!slug) return ['/']
  return slug === 'home' ? ['/'] : [`/${slug}`]
}

export const revalidatePage: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  safeRevalidate([...pathsForPage(doc?.slug), ...pathsForPage(previousDoc?.slug)])
  return doc
}

export const revalidatePageAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  safeRevalidate(pathsForPage(doc?.slug))
  return doc
}

export const revalidateArticle: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  const paths = ['/', '/kien-thuc']

  for (const slug of [doc?.slug, previousDoc?.slug]) {
    if (slug) paths.push(`/bai-viet/${slug}`)
  }

  safeRevalidate(paths)
  return doc
}

export const revalidateArticleAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  safeRevalidate(['/', '/kien-thuc', ...(doc?.slug ? [`/bai-viet/${doc.slug}`] : [])])
  return doc
}
