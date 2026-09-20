import type { GlobalConfig } from 'payload'

import { canEditContent } from '../access/roles'

const linkFields = [
  { name: 'label', type: 'text' as const, required: true, localized: true },
  { name: 'href', type: 'text' as const, required: true },
]

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Menu đầu trang',
  admin: { group: 'Hệ thống' },
  access: {
    read: () => true,
    update: canEditContent,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        ...linkFields,
        {
          name: 'children',
          type: 'array',
          labels: { singular: 'Mục con', plural: 'Mục con' },
          fields: linkFields,
        },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
    },
    {
      name: 'ctaHref',
      type: 'text',
    },
  ],
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Chân trang',
  admin: { group: 'Hệ thống' },
  access: {
    read: () => true,
    update: canEditContent,
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      labels: { singular: 'Cột', plural: 'Cột' },
      fields: [
        { name: 'heading', type: 'text', localized: true },
        {
          name: 'links',
          type: 'array',
          fields: linkFields,
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      localized: true,
    },
  ],
}
