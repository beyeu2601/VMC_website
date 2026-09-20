/**
 * Nạp nội dung từ thư mục markdown (00-SPEC.md, pages/, articles/, components/)
 * vào Payload. Chạy lại được nhiều lần: khớp theo slug rồi cập nhật.
 *
 *   npm run seed
 *
 * Bài viết luôn vào ở trạng thái nháp, chờ bác sĩ duyệt.
 */
import 'dotenv/config'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'

import config from '../payload.config.js'

const CONTENT_DIR =
  process.env.CONTENT_DIR ??
  'C:/Users/Administrator/OneDrive - tma.com.vn/Documents/SC/VMC/Webcontent from claude'

type Frontmatter = Record<string, string>

const parseFrontmatter = (raw: string): { data: Frontmatter; body: string } => {
  if (!raw.startsWith('---')) return { data: {}, body: raw }

  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: raw }

  const head = raw.slice(4, end)
  const body = raw.slice(end + 4).replace(/^\s*\n/, '')
  const data: Frontmatter = {}

  for (const line of head.split('\n')) {
    const match = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (!match) continue
    data[match[1]] = match[2].trim().replace(/^["'](.*)["']$/, '$1')
  }

  return { data, body }
}

const upsert = async <T extends 'pages' | 'articles' | 'categories' | 'plans' | 'symptoms'>(
  payload: Payload,
  collection: T,
  slugField: 'slug' | 'title',
  slug: string,
  data: Record<string, unknown>,
) => {
  const existing = await payload.find({
    collection,
    where: { [slugField]: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data: data as never,
    })
  }

  return payload.create({ collection, data: { ...data, [slugField]: slug } as never })
}

const CATEGORIES = [
  {
    slug: 'trieu-chung',
    title: 'Triệu chứng thường gặp',
    intro:
      'Những thay đổi về thể chất và cảm xúc có thể xuất hiện trong giai đoạn chuyển tiếp mãn kinh. Hiểu rõ các triệu chứng sẽ giúp bạn nhận biết điều gì đang xảy ra và tìm được cách chăm sóc phù hợp với mình.',
    seoKeywords: 'triệu chứng mãn kinh, dấu hiệu mãn kinh, bốc hỏa tuổi mãn kinh, phụ nữ bốc hỏa',
  },
  {
    slug: 'cham-soc',
    title: 'Chăm sóc sức khỏe',
    intro:
      'Hãy cùng VMC tìm hiểu những cách chăm sóc sức khỏe phù hợp hơn với cơ thể và nhịp sống của bạn trong giai đoạn mãn kinh.',
    seoKeywords: 'thực phẩm tiền mãn kinh, phụ nữ tiền mãn kinh',
  },
  {
    slug: 'tong-hop',
    title: 'Tổng hợp',
    intro: '',
    seoKeywords: 'tiền mãn kinh',
  },
]

const PLANS = [
  {
    slug: 'free-trial',
    name: 'Free Trial',
    tagline: 'Bắt đầu từ việc hiểu cơ thể mình',
    description:
      'Một bước khởi đầu nhẹ nhàng dành cho những ai muốn hiểu thêm về sức khỏe nội tiết. Với AI Assessment cùng 3 buổi tư vấn từ đội ngũ chuyên gia trong 1 tháng, bạn có thêm thời gian để lắng nghe những thay đổi của cơ thể và cùng VMC tìm ra hướng chăm sóc phù hợp với mình.',
    price: 99000,
    billingPeriod: 'first-month',
    ctaLabel: 'Bắt đầu ngay',
    order: 1,
    features: [
      { label: 'AI Assessment' },
      { label: 'Tư vấn chuyên gia', value: 'giới hạn' },
    ],
  },
  {
    slug: 'care-package',
    name: 'Care Package',
    tagline: 'Chủ động chăm sóc, nhẹ nhàng hơn mỗi ngày',
    description:
      'Đây là gói chăm sóc dành cho bạn nếu muốn duy trì việc chăm sóc sức khỏe nội tiết một cách đều đặn. Với AI Assessment, tư vấn chuyên gia và theo dõi định kỳ, bạn có thể hiểu hơn về cơ thể, chủ động chăm sóc sức khỏe nội tiết và luôn có đội ngũ VMC đồng hành khi cần.',
    price: 199000,
    billingPeriod: 'month',
    badge: 'Lựa chọn phổ biến',
    ctaLabel: 'Chọn gói Care',
    order: 2,
    features: [
      { label: 'AI Assessment' },
      { label: 'Tư vấn chuyên gia', value: 'cơ bản' },
      { label: 'Theo dõi định kỳ' },
    ],
  },
  {
    slug: 'prime-plus',
    name: 'Prime Plus Package',
    tagline: 'Một lộ trình riêng, một người đồng hành xuyên suốt',
    description:
      'Với gói Prime Plus, bạn có thể chủ động chăm sóc sức khỏe nội tiết với lộ trình được thiết kế riêng, đồng hành 1:1 cùng bác sĩ và theo dõi, điều chỉnh phác đồ theo từng giai đoạn. Không những vậy, gói Prime Plus còn bao gồm thuốc chính hãng được giao tận nhà định kỳ sau mỗi đợt điều trị, giúp bạn thuận tiện duy trì liệu trình và chăm sóc sức khỏe lâu dài.',
    price: 2390000,
    billingPeriod: 'year',
    ctaLabel: 'Khám phá gói',
    order: 3,
    features: [
      { label: 'AI Assessment' },
      { label: 'Tư vấn chuyên gia', value: 'toàn diện' },
      { label: 'Theo dõi định kỳ' },
      { label: 'Lộ trình cá nhân hóa' },
      { label: 'Bác sĩ đồng hành 1:1' },
      { label: 'Điều chỉnh phác đồ' },
      { label: 'Giao thuốc tận nhà định kỳ' },
    ],
  },
]

const NAV = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Về VMC',
    href: '/ve-vmc',
    children: [
      { label: 'Sứ mệnh và tầm nhìn', href: '/ve-vmc#su-menh' },
      { label: 'Giá trị cốt lõi', href: '/ve-vmc#gia-tri' },
    ],
  },
  {
    label: 'Chương trình chăm sóc',
    href: '/chuong-trinh',
    children: [
      { label: 'Những lợi ích bạn nhận được', href: '/chuong-trinh#loi-ich' },
      { label: 'Các gói chăm sóc tại VMC', href: '/chuong-trinh#cac-goi' },
      { label: 'Thời gian tham gia', href: '/chuong-trinh#thoi-gian' },
    ],
  },
  {
    label: 'Thư viện kiến thức',
    href: '/kien-thuc',
    children: [
      { label: 'Triệu chứng thường gặp', href: '/kien-thuc/trieu-chung' },
      { label: 'Chăm sóc sức khỏe', href: '/kien-thuc/cham-soc' },
      { label: 'Tổng hợp', href: '/kien-thuc/tong-hop' },
    ],
  },
  {
    label: 'Đồng hành cùng VMC',
    href: '/dong-hanh',
    children: [
      { label: 'Câu hỏi thường gặp', href: '/dong-hanh#cau-hoi' },
      { label: 'Đặt lịch tư vấn', href: '/dong-hanh#dat-lich' },
      { label: 'Thông tin liên hệ', href: '/dong-hanh#lien-he' },
    ],
  },
]

const seed = async () => {
  const payload = await getPayload({ config: await config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const toLexical = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown })

  // 1. Chuyên mục
  const categoryIds: Record<string, number | string> = {}
  for (const category of CATEGORIES) {
    const doc = await upsert(payload, 'categories', 'slug', category.slug, category)
    categoryIds[category.slug] = doc.id
  }
  payload.logger.info(`Chuyên mục: ${CATEGORIES.length}`)

  // 2. Gói chăm sóc
  for (const plan of PLANS) {
    await upsert(payload, 'plans', 'slug', plan.slug, plan)
  }
  payload.logger.info(`Gói chăm sóc: ${PLANS.length}`)

  // 3. Bài viết từ articles/*.md
  const articlesDir = path.join(CONTENT_DIR, 'articles')
  const files = (await fs.readdir(articlesDir)).filter(
    (file) => file.endsWith('.md') && file !== '_index.md',
  )

  const articleIds: Record<string, number | string> = {}

  for (const file of files) {
    const raw = await fs.readFile(path.join(articlesDir, file), 'utf8')
    const { data, body } = parseFrontmatter(raw)
    const slug = data.slug ?? file.replace(/\.md$/, '')
    const categorySlug =
      data.category === 'trieu-chung' || data.category === 'cham-soc' || data.category === 'tong-hop'
        ? data.category
        : 'tong-hop'

    // Bỏ dòng H1 vì tiêu đề đã nằm ở header trang
    const content = body.replace(/^#\s+.*\n+/, '')

    const doc = await upsert(payload, 'articles', 'slug', slug, {
      title: data.title ?? slug,
      excerpt: data.excerpt ?? '',
      category: categoryIds[categorySlug],
      content: toLexical(content),
      sourceNote: data.source,
      components: ['symptom-index', 'care-program-callout'],
      // Nhập vào là nháp; bác sĩ duyệt rồi mới xuất bản được
      reviewStatus: 'draft',
      _status: 'draft',
    })

    articleIds[slug] = doc.id
  }
  payload.logger.info(`Bài viết: ${files.length}`)

  // 4. Chip triệu chứng từ components/symptom-index.md
  const symptomRaw = await fs.readFile(
    path.join(CONTENT_DIR, 'components', 'symptom-index.md'),
    'utf8',
  )
  const symptomRows = symptomRaw
    .split('\n')
    .filter((line) => line.startsWith('|') && !line.includes('---') && !line.includes('Triệu chứng |'))

  let order = 0
  for (const row of symptomRows) {
    const [, title, link] = row.split('|').map((cell) => cell.trim())
    if (!title) continue

    const articleSlug = link?.match(/\/bai-viet\/([a-z0-9-]+)/)?.[1]
    order += 1

    await upsert(payload, 'symptoms', 'title', title, {
      title,
      order,
      article: articleSlug ? (articleIds[articleSlug] ?? null) : null,
    })
  }
  payload.logger.info(`Triệu chứng: ${order}`)

  // 5. Global
  await payload.updateGlobal({
    slug: 'header',
    data: {
      items: NAV,
      ctaLabel: 'Đặt lịch tư vấn',
      ctaHref: '/dong-hanh#dat-lich',
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      columns: [
        {
          heading: 'Khám phá',
          links: [
            { label: 'Về VMC', href: '/ve-vmc' },
            { label: 'Chương trình chăm sóc', href: '/chuong-trinh' },
            { label: 'Thư viện kiến thức', href: '/kien-thuc' },
            { label: 'Đồng hành cùng VMC', href: '/dong-hanh' },
          ],
        },
        {
          heading: 'Liên hệ',
          links: [
            { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
            { label: 'Điều khoản sử dụng', href: '/dieu-khoan' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} VMC`,
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'VMC',
      tagline: 'Sống trọn phong độ. Rạng rỡ theo cách của bạn.',
      medicalDisclaimer:
        'Nội dung mang tính tham khảo, không thay thế chẩn đoán và điều trị của bác sĩ.',
      careProgramCallout: {
        heading: 'Chương trình chăm sóc tại VMC',
        body: 'Tìm hiểu quy trình đánh giá và các lựa chọn chăm sóc tại VMC.',
        ctaLabel: 'Xem quy trình chăm sóc',
        ctaHref: '/chuong-trinh',
      },
      aiAssessmentEnabled: false,
    },
  })
  payload.logger.info('Đã cập nhật global')

  // 6. Trang chủ
  await upsert(payload, 'pages', 'slug', 'home', {
    title: 'Trang chủ',
    metaDescription:
      'VMC đồng hành cùng bạn trên hành trình chăm sóc sức khỏe nội tiết bằng sự kết hợp giữa chuyên môn y khoa chuẩn quốc tế, công nghệ AI và lộ trình chăm sóc cá nhân hóa.',
    _status: 'published',
    layout: [
      {
        blockType: 'hero',
        heading: 'Sống trọn phong độ. Rạng rỡ theo cách của bạn.',
        lead: 'VMC đồng hành cùng bạn trên hành trình chăm sóc sức khỏe nội tiết bằng sự kết hợp giữa chuyên môn y khoa chuẩn quốc tế, công nghệ AI và lộ trình chăm sóc cá nhân hóa, giúp bạn chủ động gìn giữ sự cân bằng từ bên trong, duy trì nguồn năng lượng và phong độ sống lâu dài.',
        primaryCta: { label: 'Đánh giá triệu chứng nhanh với AI', href: '/#danh-gia-ai' },
        secondaryCta: { label: 'Đặt lịch tư vấn', href: '/dong-hanh#dat-lich' },
      },
      {
        blockType: 'richText',
        heading: 'Chăm sóc sức khỏe nội tiết, dễ dàng và chủ động hơn',
        background: 'none',
        content: toLexical(
          'Tại VMC, chúng tôi kết hợp công nghệ AI, các phác đồ điều trị theo tiêu chuẩn quốc tế và chuyên môn của đội ngũ bác sĩ để xây dựng lộ trình chăm sóc sức khỏe nội tiết được cá nhân hóa cho từng người. Với lộ trình chăm sóc dài hạn, theo dõi liên tục và cam kết điều trị bằng thuốc chính hãng, VMC giúp bạn chủ động chăm sóc sức khỏe nội tiết một cách thuận tiện, minh bạch và đáng tin cậy.\n\n[Tìm hiểu về VMC](/ve-vmc)',
        ),
      },
      {
        blockType: 'plans',
        heading: 'Gói dịch vụ VMC',
        intro:
          'Mỗi gói chăm sóc tại VMC được xây dựng để đồng hành cùng bạn từ những bước đầu tiên đến hành trình lâu dài, với phác đồ điều trị phù hợp theo từng nhu cầu và từng giai đoạn của cơ thể.',
      },
      {
        blockType: 'articleList',
        heading: 'Bài viết nổi bật',
        limit: 6,
        linkLabel: 'Xem thư viện kiến thức',
        linkHref: '/kien-thuc',
      },
      {
        blockType: 'callout',
        heading: 'Bắt đầu hành trình chăm sóc theo cách phù hợp với bạn.',
        body: 'Hiểu cơ thể mình không nhất thiết phải bắt đầu từ một buổi thăm khám. Chỉ với vài phút ngắn ngủi thực hiện bài đánh giá bằng AI, cũng có thể giúp bạn nhận diện sớm những thay đổi của sức khỏe nội tiết để đội ngũ chuyên gia của VMC đồng hành cùng bạn với lộ trình chăm sóc phù hợp ngay từ đầu.',
        ctaLabel: 'Đặt lịch tư vấn',
        ctaHref: '/dong-hanh#dat-lich',
      },
    ],
  })
  payload.logger.info('Đã cập nhật trang chủ')

  process.exit(0)
}

void seed()
