import type { Block } from 'payload'

const link = [
  { name: 'label', type: 'text' as const, localized: true },
  { name: 'href', type: 'text' as const },
]

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'lead', type: 'textarea', localized: true },
    {
      name: 'primaryCta',
      type: 'group',
      fields: link,
    },
    {
      name: 'secondaryCta',
      type: 'group',
      fields: link,
    },
  ],
}

export const BannerBlock: Block = {
  slug: 'banner',
  labels: { singular: 'Banner trang con', plural: 'Banner trang con' },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'lead', type: 'textarea', localized: true },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Đoạn nội dung', plural: 'Đoạn nội dung' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'content', type: 'richText', required: true, localized: true },
    {
      name: 'background',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Không nền', value: 'none' },
        { label: 'Tím nhạt', value: 'tint' },
        { label: 'Be', value: 'neutral' },
      ],
    },
  ],
}

export const PlansBlock: Block = {
  slug: 'plans',
  labels: { singular: 'Bảng gói chăm sóc', plural: 'Bảng gói chăm sóc' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'plans',
      type: 'relationship',
      relationTo: 'plans',
      hasMany: true,
      admin: { description: 'Để trống thì hiển thị tất cả gói theo thứ tự.' },
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faqBlock',
  labels: { singular: 'Câu hỏi thường gặp', plural: 'Câu hỏi thường gặp' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'faqs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      admin: { description: 'Để trống thì hiển thị tất cả câu hỏi theo thứ tự.' },
    },
  ],
}

export const ArticleListBlock: Block = {
  slug: 'articleList',
  labels: { singular: 'Danh sách bài viết', plural: 'Danh sách bài viết' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { description: 'Để trống thì lấy bài mới nhất của mọi chuyên mục.' },
    },
    { name: 'limit', type: 'number', defaultValue: 3 },
    { ...link[0], name: 'linkLabel' },
    { ...link[1], name: 'linkHref' },
  ],
}

export const SymptomIndexBlock: Block = {
  slug: 'symptomIndex',
  labels: { singular: 'Chip triệu chứng', plural: 'Chip triệu chứng' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Box CTA', plural: 'Box CTA' },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'ctaLabel', type: 'text', localized: true },
    { name: 'ctaHref', type: 'text' },
  ],
}

export const pageBlocks = [
  HeroBlock,
  BannerBlock,
  RichTextBlock,
  PlansBlock,
  FaqBlock,
  ArticleListBlock,
  SymptomIndexBlock,
  CalloutBlock,
]
