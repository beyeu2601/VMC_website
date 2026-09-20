import type { CollectionConfig } from 'payload'

import { canEditContent, isAdmin } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Nội dung',
  },
  access: {
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 480 },
      { name: 'card', width: 768 },
      { name: 'hero', width: 1600 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Mô tả ảnh cho người dùng trình đọc màn hình. Bắt buộc.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'credit',
      type: 'text',
      localized: true,
      admin: {
        description: 'Nguồn ảnh. Ghi rõ nếu ảnh có bản quyền.',
      },
    },
  ],
}
