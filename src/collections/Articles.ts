import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { canEditContent, isAdmin, isClinicalReviewerField } from '../access/roles'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'

/** Các trường tạo nên nội dung bài. Sửa bất kỳ trường nào trong đây thì phải duyệt lại. */
const CONTENT_FIELDS = [
  'title',
  'slug',
  'excerpt',
  'content',
  'category',
  'symptomCodes',
  'pillarCode',
  'references',
  'heroImage',
  'components',
] as const

const contentChanged = (data: Record<string, unknown>, original?: Record<string, unknown>) => {
  if (!original) return true

  return CONTENT_FIELDS.some((field) => {
    if (!(field in data)) return false
    return JSON.stringify(data[field] ?? null) !== JSON.stringify(original[field] ?? null)
  })
}

/**
 * Quy trình duyệt:
 * - Chỉ clinical reviewer hoặc admin đổi được reviewStatus (chặn ở field access).
 * - Không xuất bản được khi chưa ở trạng thái clinically-approved.
 * - Sửa nội dung sau khi đã duyệt thì quay lại in-review.
 */
const enforceClinicalApproval: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const next = { ...data }
  const previousStatus = originalDoc?.reviewStatus

  // Cập nhật một phần thì data không chứa reviewStatus, phải lấy từ bản hiện tại
  const changed = operation === 'update' && contentChanged(next, originalDoc)

  if (changed && (next.reviewStatus ?? previousStatus) === 'clinically-approved') {
    // Nội dung vừa đổi thì bản duyệt cũ không còn giá trị
    next.reviewStatus = 'in-review'
    next.approvedBy = null
    next.approvedAt = null
  }

  const effectiveStatus = next.reviewStatus ?? previousStatus

  if (next._status === 'published' && effectiveStatus !== 'clinically-approved') {
    throw new APIError(
      changed
        ? 'Nội dung vừa sửa cần bác sĩ duyệt lại. Hãy lưu thành bản nháp; bản đang xuất bản vẫn giữ nguyên.'
        : 'Bài viết chưa được bác sĩ duyệt (clinically-approved) nên chưa thể xuất bản.',
      403,
    )
  }

  if (effectiveStatus === 'clinically-approved' && previousStatus !== 'clinically-approved') {
    next.approvedBy = req.user?.id ?? null
    next.approvedAt = new Date().toISOString()
  }

  return next
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Bài viết',
    plural: 'Bài viết',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'reviewStatus', '_status', 'updatedAt'],
    group: 'Nội dung',
    preview: (doc) => (typeof doc?.slug === 'string' ? `/bai-viet/${doc.slug}` : null),
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
    beforeChange: [enforceClinicalApproval],
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
        description: 'Đường dẫn bài, ví dụ con-boc-hoa.',
      },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Nháp', value: 'draft' },
        { label: 'Chờ duyệt y khoa', value: 'in-review' },
        { label: 'Đã duyệt y khoa', value: 'clinically-approved' },
      ],
      access: {
        // Editor không tự duyệt bài của mình
        update: isClinicalReviewerField,
      },
      admin: {
        position: 'sidebar',
        description: 'Chỉ bác sĩ (clinical reviewer) hoặc admin đổi được trường này.',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Câu mở đầu, dùng cho card bài viết và thẻ meta description.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'references',
      type: 'array',
      localized: true,
      labels: {
        singular: 'Nguồn tham khảo',
        plural: 'Nguồn tham khảo',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'components',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Chip triệu chứng (symptom-index)', value: 'symptom-index' },
        { label: 'Box chương trình chăm sóc', value: 'care-program-callout' },
      ],
      admin: {
        description: 'Các khối dùng chung chèn ở cuối bài.',
      },
    },
    {
      name: 'symptomCodes',
      type: 'text',
      admin: {
        description: 'Mã triệu chứng liên quan (S1 đến S14), phân cách bằng dấu phẩy.',
      },
    },
    {
      name: 'pillarCode',
      type: 'text',
      admin: {
        description: 'Mã content pillar (T1 đến T5).',
      },
    },
    {
      name: 'sourceNote',
      type: 'text',
      admin: {
        description: 'File hoặc tài liệu gốc của bài, phục vụ truy vết nội bộ.',
      },
    },
  ],
}
