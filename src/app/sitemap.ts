import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const [pages, articles, categories] = await Promise.all([
    payload.find({
      overrideAccess: false,
      collection: 'pages',
      limit: 200,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      overrideAccess: false,
      collection: 'articles',
      limit: 1000,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      overrideAccess: false,
      collection: 'categories',
      limit: 50,
      select: { slug: true, updatedAt: true },
    }),
  ])

  return [
    ...pages.docs.map((page) => ({
      url: page.slug === 'home' ? baseUrl : `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
    })),
    ...categories.docs.map((category) => ({
      url: `${baseUrl}/kien-thuc/${category.slug}`,
      lastModified: category.updatedAt,
    })),
    ...articles.docs.map((article) => ({
      url: `${baseUrl}/bai-viet/${article.slug}`,
      lastModified: article.updatedAt,
    })),
  ]
}
