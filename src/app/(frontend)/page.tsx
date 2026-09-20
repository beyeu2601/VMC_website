import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { getPayloadClient } from '@/lib/payload'

const getHomePage = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    overrideAccess: false,
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 2,
  })

  return docs[0] ?? null
}

export const generateMetadata = async (): Promise<Metadata> => {
  const page = await getHomePage()

  return {
    title: page?.title ?? 'VMC',
    description: page?.metaDescription ?? undefined,
  }
}

export default async function HomePage() {
  const page = await getHomePage()

  if (!page) notFound()

  return <RenderBlocks blocks={page.layout} />
}
