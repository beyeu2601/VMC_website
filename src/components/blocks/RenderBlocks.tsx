import Link from 'next/link'
import type React from 'react'

import type { Category, Faq, Page, Plan } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { ArticleCard } from '@/components/ArticleCard'
import { RichText } from '@/components/RichText'
import { SymptomIndex } from '@/components/SymptomIndex'

type Block = Page['layout'][number]

const priceFormatter = new Intl.NumberFormat('vi-VN')

const periodLabel: Record<string, string> = {
  'first-month': 'tháng đầu tiên',
  month: 'mỗi tháng',
  quarter: 'mỗi quý',
  year: 'mỗi năm',
}

const sectionClass = (background?: string | null) => {
  if (background === 'tint') return 'section section--tint'
  if (background === 'neutral') return 'section section--neutral'
  return 'section'
}

const Hero = ({ block }: { block: Extract<Block, { blockType: 'hero' }> }) => (
  <section className="hero">
    <div className="container">
      <h1>{block.heading}</h1>
      {block.lead && <p className="hero__lead">{block.lead}</p>}
      <div className="hero__actions">
        {block.primaryCta?.label && block.primaryCta?.href && (
          <Link className="btn btn--on-dark" href={block.primaryCta.href}>
            {block.primaryCta.label}
          </Link>
        )}
        {block.secondaryCta?.label && block.secondaryCta?.href && (
          <Link className="btn btn--on-dark" href={block.secondaryCta.href}>
            {block.secondaryCta.label}
          </Link>
        )}
      </div>
    </div>
  </section>
)

const Banner = ({ block }: { block: Extract<Block, { blockType: 'banner' }> }) => (
  <section className="page-banner">
    <div className="container">
      <h1>{block.heading}</h1>
      {block.lead && <p>{block.lead}</p>}
    </div>
  </section>
)

const Plans = async ({ block }: { block: Extract<Block, { blockType: 'plans' }> }) => {
  const payload = await getPayloadClient()
  const selected = (block.plans ?? []).filter((plan): plan is Plan => typeof plan === 'object')

  const plans =
    selected.length > 0
      ? selected
      : (await payload.find({ overrideAccess: false, collection: 'plans', limit: 20, sort: 'order' }))
          .docs

  if (plans.length === 0) return null

  return (
    <section className="section">
      <div className="container">
        {block.heading && <h2>{block.heading}</h2>}
        {block.intro && <p className="prose">{block.intro}</p>}
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className="plan" key={plan.id}>
              {plan.badge && <span className="plan__badge">{plan.badge}</span>}
              <h3>{plan.name}</h3>
              {plan.tagline && <p>{plan.tagline}</p>}
              <p className="plan__price">
                {priceFormatter.format(plan.price)}đ{' '}
                <span className="plan__period">/ {periodLabel[plan.billingPeriod] ?? ''}</span>
              </p>
              {plan.description && <p>{plan.description}</p>}
              {plan.features && plan.features.length > 0 && (
                <ul className="plan__features">
                  {plan.features.map((feature) => (
                    <li key={feature.id ?? feature.label}>
                      {feature.label}
                      {feature.value ? `: ${feature.value}` : ''}
                    </li>
                  ))}
                </ul>
              )}
              <Link className="btn btn--primary" href="/dong-hanh#dat-lich">
                {plan.ctaLabel ?? 'Đặt lịch tư vấn'}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const Faqs = async ({ block }: { block: Extract<Block, { blockType: 'faqBlock' }> }) => {
  const payload = await getPayloadClient()
  const selected = (block.faqs ?? []).filter((faq): faq is Faq => typeof faq === 'object')

  const faqs =
    selected.length > 0
      ? selected
      : (await payload.find({ overrideAccess: false, collection: 'faqs', limit: 50, sort: 'order' }))
          .docs

  if (faqs.length === 0) return null

  return (
    <section className="section section--tint" id="cau-hoi">
      <div className="container">
        {block.heading && <h2>{block.heading}</h2>}
        <div className="faq">
          {faqs.map((faq) => (
            <details key={faq.id}>
              <summary>{faq.question}</summary>
              <RichText data={faq.answer} />
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

const ArticleList = async ({ block }: { block: Extract<Block, { blockType: 'articleList' }> }) => {
  const payload = await getPayloadClient()
  const categoryId =
    typeof block.category === 'object' && block.category
      ? (block.category as Category).id
      : block.category

  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'articles',
    limit: block.limit ?? 3,
    sort: '-updatedAt',
    depth: 1,
    where: categoryId ? { category: { equals: categoryId } } : undefined,
  })

  if (docs.length === 0) return null

  return (
    <section className="section">
      <div className="container">
        {block.heading && <h2>{block.heading}</h2>}
        <ul className="card-grid">
          {docs.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </ul>
        {block.linkLabel && block.linkHref && (
          <p style={{ marginTop: 'var(--space-3)' }}>
            <Link className="btn btn--ghost" href={block.linkHref}>
              {block.linkLabel}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}

const Callout = ({ block }: { block: Extract<Block, { blockType: 'callout' }> }) => (
  <section className="section">
    <div className="container">
      <div className="callout">
        <h2>{block.heading}</h2>
        {block.body && <p>{block.body}</p>}
        {block.ctaLabel && block.ctaHref && (
          <Link className="btn btn--on-dark" href={block.ctaHref}>
            {block.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  </section>
)

export const RenderBlocks = ({ blocks }: { blocks: Page['layout'] }) => (
  <>
    {(blocks ?? []).map((block, index) => {
      const key = block.id ?? `${block.blockType}-${index}`

      switch (block.blockType) {
        case 'hero':
          return <Hero block={block} key={key} />
        case 'banner':
          return <Banner block={block} key={key} />
        case 'richText':
          return (
            <section className={sectionClass(block.background)} key={key}>
              <div className="container prose">
                {block.heading && <h2>{block.heading}</h2>}
                <RichText data={block.content} />
              </div>
            </section>
          )
        case 'plans':
          return <Plans block={block} key={key} />
        case 'faqBlock':
          return <Faqs block={block} key={key} />
        case 'articleList':
          return <ArticleList block={block} key={key} />
        case 'symptomIndex':
          return (
            <section className="section" key={key}>
              <div className="container">
                {block.heading && <h2>{block.heading}</h2>}
                {block.intro && <p className="prose">{block.intro}</p>}
                <SymptomIndex />
              </div>
            </section>
          )
        case 'callout':
          return <Callout block={block} key={key} />
        default:
          return null
      }
    }) as React.ReactNode[]}
  </>
)
