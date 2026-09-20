import type { CollectionConfig } from 'payload'

import { canEditContent, isAdmin } from '../access/roles'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: 'Câu hỏi thường gặp',
    plural: 'Câu hỏi thường gặp',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order'],
    group: 'Nội dung',
  },
  access: {
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
