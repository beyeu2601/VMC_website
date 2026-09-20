import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Category } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { SymptomIndex } from '@/components/SymptomIndex'
import { getPayloadClient } from '@/lib/payload'

type Params = { params: Promise<{ slug: string }> }

const getArticle = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  return docs[0] ?? null
}

export const generateStaticParams = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'articles',
    limit: 500,
    select: { slug: true },
  })

  return docs.map((article) => ({ slug: article.slug }))
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params
  const article = await getArticle(slug)

  return {
    title: article?.title,
    description: article?.excerpt,
  }
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) notFound()

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const category = typeof article.category === 'object' ? (article.category as Category) : null
  const components = article.components ?? []

  return (
    <article>
      <header className="article-header">
        <div className="container prose">
          {category && <p className="article-meta">{category.title}</p>}
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
        </div>
      </header>

      <div className="section">
        <div className="container prose">
          <RichText data={article.content} />

          {article.references && article.references.length > 0 && (
            <section className="references">
              <h2>Nguồn tham khảo</h2>
              <ul>
                {article.references.map((reference) => (
                  <li key={reference.id ?? reference.label}>
                    {reference.url ? (
                      <a href={reference.url} rel="noopener noreferrer" target="_blank">
                        {reference.label}
                      </a>
                    ) : (
                      reference.label
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {components.includes('symptom-index') && (
            <section>
              <h2>Các triệu chứng mãn kinh khác</h2>
              <SymptomIndex />
            </section>
          )}

          {components.includes('care-program-callout') && settings?.careProgramCallout?.heading && (
            <aside className="callout">
              <h2>{settings.careProgramCallout.heading}</h2>
              {settings.careProgramCallout.body && <p>{settings.careProgramCallout.body}</p>}
              {settings.careProgramCallout.ctaLabel && settings.careProgramCallout.ctaHref && (
                <Link className="btn btn--on-dark" href={settings.careProgramCallout.ctaHref}>
                  {settings.careProgramCallout.ctaLabel}
                </Link>
              )}
            </aside>
          )}

          {settings?.medicalDisclaimer && <p className="disclaimer">{settings.medicalDisclaimer}</p>}
        </div>
      </div>
    </article>
  )
}
