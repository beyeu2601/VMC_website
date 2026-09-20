import Link from 'next/link'

import type { Article, Category } from '@/payload-types'

export const ArticleCard = ({ article }: { article: Article }) => {
  const category = typeof article.category === 'object' ? (article.category as Category) : null

  return (
    <li className="card">
      {category && <span className="card__eyebrow">{category.title}</span>}
      <h3 className="card__title">
        <Link href={`/bai-viet/${article.slug}`}>{article.title}</Link>
      </h3>
      <p>{article.excerpt}</p>
    </li>
  )
}
