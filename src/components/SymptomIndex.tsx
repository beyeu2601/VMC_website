import Link from 'next/link'

import type { Article } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

/** Chip triệu chứng: có bài thì link sang bài, chưa có thì hiển thị dạng chữ. */
export const SymptomIndex = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'symptoms',
    limit: 200,
    sort: 'order',
    depth: 1,
  })

  if (docs.length === 0) return null

  return (
    <ul className="chips">
      {docs.map((symptom) => {
        const article = typeof symptom.article === 'object' ? (symptom.article as Article) : null

        return (
          <li key={symptom.id}>
            {article ? (
              <Link className="chip" href={`/bai-viet/${article.slug}`}>
                {symptom.title}
              </Link>
            ) : (
              <span className="chip">{symptom.title}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
