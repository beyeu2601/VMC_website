import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/ArticleCard'
import { SymptomIndex } from '@/components/SymptomIndex'
import { getPayloadClient } from '@/lib/payload'

type Params = { params: Promise<{ category: string }> }

const getCategory = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return docs[0] ?? null
}

export const generateStaticParams = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'categories',
    limit: 50,
    select: { slug: true },
  })

  return docs.map((category) => ({ category: category.slug }))
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { category: slug } = await params
  const category = await getCategory(slug)

  return {
    title: category?.title,
    description: category?.intro ?? undefined,
  }
}

export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params
  const category = await getCategory(slug)

  if (!category) notFound()

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'articles',
    where: { category: { equals: category.id } },
    limit: 100,
    sort: '-updatedAt',
    depth: 1,
  })

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <h1>{category.title}</h1>
          {category.intro && <p>{category.intro}</p>}
        </div>
      </section>

      {slug === 'trieu-chung' && (
        <section className="section">
          <div className="container">
            <SymptomIndex />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          {docs.length === 0 ? (
            <p>Chuyên mục này chưa có bài viết được xuất bản.</p>
          ) : (
            <ul className="card-grid">
              {docs.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
