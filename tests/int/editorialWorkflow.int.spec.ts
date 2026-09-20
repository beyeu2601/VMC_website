import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@/payload.config'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Category, User } from '@/payload-types'

let payload: Payload
let editor: User
let reviewer: User
let category: Category

const suffix = `wf-${Date.now()}`

type ArticleInput = RequiredDataFromCollectionSlug<'articles'>

const articleData = (over: Partial<ArticleInput> = {}): ArticleInput => ({
  title: 'Bài kiểm thử quy trình duyệt',
  reviewStatus: 'draft',
  slug: `bai-kiem-thu-${suffix}`,
  category: category.id,
  excerpt: 'Nội dung dùng cho kiểm thử, không xuất bản.',
  content: {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [{ type: 'text', text: 'Đoạn văn kiểm thử.', version: 1 }],
        },
      ],
    },
  },
  ...over,
})

describe('Quy trình duyệt y khoa', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    editor = (await payload.create({
      collection: 'users',
      data: {
        email: `editor-${suffix}@example.com`,
        password: 'Test1234!pass',
        name: 'Editor test',
        role: 'editor',
      },
    })) as User

    reviewer = (await payload.create({
      collection: 'users',
      data: {
        email: `reviewer-${suffix}@example.com`,
        password: 'Test1234!pass',
        name: 'Reviewer test',
        role: 'clinical-reviewer',
      },
    })) as User

    category = (await payload.create({
      collection: 'categories',
      data: { title: 'Kiểm thử', slug: `kiem-thu-${suffix}` },
    })) as Category
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'articles',
      where: { slug: { contains: suffix } },
    })
    await payload.delete({
      collection: 'categories',
      where: { slug: { contains: suffix } },
    })
    await payload.delete({
      collection: 'users',
      where: { email: { contains: suffix } },
    })
  })

  it('không cho xuất bản bài chưa duyệt y khoa', async () => {
    await expect(
      payload.create({
        collection: 'articles',
        data: articleData({ _status: 'published' }),
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/chưa được bác sĩ duyệt/)
  })

  it('editor không tự đặt trạng thái đã duyệt', async () => {
    const draft = await payload.create({
      collection: 'articles',
      data: articleData(),
      user: editor,
      overrideAccess: false,
    })

    const updated = await payload.update({
      collection: 'articles',
      id: draft.id,
      data: { reviewStatus: 'clinically-approved' },
      user: editor,
      overrideAccess: false,
    })

    expect(updated.reviewStatus).not.toBe('clinically-approved')
  })

  it('bác sĩ duyệt xong thì xuất bản được, và sửa nội dung thì phải duyệt lại', async () => {
    const draft = await payload.create({
      collection: 'articles',
      data: articleData({ slug: `bai-kiem-thu-2-${suffix}` }),
      user: editor,
      overrideAccess: false,
    })

    const approved = await payload.update({
      collection: 'articles',
      id: draft.id,
      data: { reviewStatus: 'clinically-approved' },
      user: reviewer,
      overrideAccess: false,
    })
    expect(approved.reviewStatus).toBe('clinically-approved')
    expect(approved.approvedBy).toBeTruthy()

    const published = await payload.update({
      collection: 'articles',
      id: draft.id,
      data: { _status: 'published' },
      user: editor,
      overrideAccess: false,
    })
    expect(published._status).toBe('published')

    // Sửa thẳng lên bản đang xuất bản thì bị chặn, vì nội dung mới chưa ai duyệt
    await expect(
      payload.update({
        collection: 'articles',
        id: draft.id,
        data: { excerpt: 'Sửa thẳng lên bản đang chạy.' },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/cần bác sĩ duyệt lại/)

    // Đúng quy trình: sửa vào bản nháp, bản đã xuất bản vẫn giữ nguyên
    const edited = await payload.update({
      collection: 'articles',
      id: draft.id,
      data: { excerpt: 'Sửa lại phần mở đầu sau khi đã duyệt.' },
      draft: true,
      user: editor,
      overrideAccess: false,
    })
    expect(edited.reviewStatus).toBe('in-review')

    const live = await payload.findByID({ collection: 'articles', id: draft.id })
    expect(live._status).toBe('published')
    expect(live.excerpt).toBe('Nội dung dùng cho kiểm thử, không xuất bản.')
  })

  it('khách chưa đăng nhập chỉ đọc được bài đã xuất bản', async () => {
    const result = await payload.find({
      collection: 'articles',
      overrideAccess: false,
      where: { slug: { contains: suffix } },
    })

    expect(result.docs.every((doc) => doc._status === 'published')).toBe(true)
  })
})
