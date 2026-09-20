import type { CollectionConfig } from 'payload'

import { canEditContent, isAdmin } from '../access/roles'

export const Symptoms: CollectionConfig = {
  slug: 'symptoms',
  labels: {
    singular: 'Triệu chứng',
    plural: 'Triệu chứng',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'code', 'article'],
    group: 'Nội dung',
    description:
      'Danh sách chip triệu chứng dùng cho component symptom-index và phần Đánh giá AI.',
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
      name: 'code',
      type: 'text',
      index: true,
      admin: {
        description: 'Mã nhóm theo taxonomy, ví dụ S1 đến S14. Để trống nếu chưa phân nhóm.',
      },
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      admin: {
        description: 'Bài viết tương ứng. Để trống nếu chưa có bài.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Thứ tự hiển thị, số nhỏ lên trước.',
      },
    },
  ],
}
