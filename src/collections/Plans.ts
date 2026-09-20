import type { CollectionConfig } from 'payload'

import { canEditContent, isAdmin } from '../access/roles'

export const Plans: CollectionConfig = {
  slug: 'plans',
  labels: {
    singular: 'Gói chăm sóc',
    plural: 'Gói chăm sóc',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'billingPeriod', 'order'],
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
      name: 'name',
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
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Số tiền theo VND, ví dụ 199000.',
      },
    },
    {
      name: 'billingPeriod',
      type: 'select',
      required: true,
      options: [
        { label: 'Tháng đầu tiên', value: 'first-month' },
        { label: 'Mỗi tháng', value: 'month' },
        { label: 'Mỗi quý', value: 'quarter' },
        { label: 'Mỗi năm', value: 'year' },
      ],
    },
    {
      name: 'badge',
      type: 'text',
      localized: true,
      admin: {
        description: 'Nhãn nhỏ trên card, ví dụ "Lựa chọn phổ biến". Tách riêng khỏi nút CTA.',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      labels: {
        singular: 'Quyền lợi',
        plural: 'Quyền lợi',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', admin: { description: 'Để trống nghĩa là có.' } },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
