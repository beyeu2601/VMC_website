import type { CollectionConfig } from 'payload'

import { canEditContent, isAdmin } from '../access/roles'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { pageBlocks } from '../blocks'
import { revalidatePage, revalidatePageAfterDelete } from '../hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Trang',
    plural: 'Trang',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Nội dung',
    preview: (doc) => (typeof doc?.slug === 'string' ? (doc.slug === 'home' ? '/' : `/${doc.slug}`) : null),
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    read: publishedOrLoggedIn,
    create: canEditContent,
    update: canEditContent,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Dùng "home" cho trang chủ. Các trang khác: ve-vmc, chuong-trinh, dong-hanh...',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: {
        position: 'sidebar',
        description: 'Mô tả hiển thị trên Google, nên dưới 160 ký tự.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      blocks: pageBlocks,
    },
  ],
}
