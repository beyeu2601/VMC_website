import type { GlobalConfig } from 'payload'

import { canEditContent } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cấu hình chung',
  admin: {
    group: 'Hệ thống',
  },
  access: {
    read: () => true,
    update: canEditContent,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'VMC',
      localized: true,
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'medicalDisclaimer',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Câu miễn trừ y khoa hiển thị ở cuối bài viết và footer.',
      },
    },
    {
      name: 'careProgramCallout',
      type: 'group',
      label: 'Box chương trình chăm sóc',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
        { name: 'ctaLabel', type: 'text', localized: true },
        { name: 'ctaHref', type: 'text' },
      ],
    },
    {
      name: 'aiAssessmentEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Bật phần tóm tắt bằng Gemini trong Đánh giá AI. Tắt thì chỉ dùng kết quả theo luật.',
      },
    },
  ],
}
