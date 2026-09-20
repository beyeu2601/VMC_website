import type { CollectionConfig } from 'payload'

import { canEditContent, isAdmin } from '../access/roles'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Chuyên mục',
    plural: 'Chuyên mục',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
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
        description: 'Dùng trong URL, ví dụ trieu-chung, cham-soc, tong-hop.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Dẫn nhập hiển thị ở đầu trang chuyên mục.',
      },
    },
    {
      name: 'seoKeywords',
      type: 'text',
      localized: true,
      admin: {
        description: 'Các từ khóa chính, phân cách bằng dấu phẩy.',
      },
    },
  ],
}
