import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { getPayloadClient } from '@/lib/payload'

type Params = { params: Promise<{ slug: string }> }

const getPage = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  return docs[0] ?? null
}

export const generateStaticParams = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'pages',
    limit: 100,
    select: { slug: true },
  })

  return docs.filter((page) => page.slug !== 'home').map((page) => ({ slug: page.slug }))
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params
  const page = await getPage(slug)

  return {
    title: page?.title,
    description: page?.metaDescription ?? undefined,
  }
}

export default async function DynamicPage({ params }: Params) {
  const { slug } = await params

  if (slug === 'home') notFound()

  const page = await getPage(slug)

  if (!page) notFound()

  return <RenderBlocks blocks={page.layout} />
}
