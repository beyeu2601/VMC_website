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

const FAQS = [
  {
    question: 'Làm thế nào để tôi bắt đầu tham gia chương trình chăm sóc tại VMC?',
    answer:
      'Bạn có thể bắt đầu bằng cách đăng ký tư vấn cùng bác sĩ tại VMC. Sau khi tiếp nhận thông tin ban đầu, đội ngũ y tế sẽ hướng dẫn bạn các bước tiếp theo và trao đổi về nhu cầu chăm sóc sức khỏe trong giai đoạn mãn kinh.',
    order: 1,
  },
  {
    question: 'Dựa vào đâu để VMC xác định phương pháp điều trị phù hợp với tôi?',
    answer:
      'Bác sĩ sẽ đánh giá các triệu chứng, tuổi, thời điểm mãn kinh, tiền sử bệnh, các thuốc đang sử dụng và những yếu tố liên quan khác để xác định phương pháp chăm sóc hoặc điều trị phù hợp. Với liệu pháp hormone mãn kinh (MHT), bác sĩ sẽ cân nhắc lợi ích và nguy cơ dựa trên tình trạng sức khỏe và nhu cầu riêng của từng người.',
    order: 2,
  },
  {
    question: 'Phương pháp chăm sóc tại VMC có được cá nhân hóa không?',
    answer:
      'Có. VMC hướng đến việc xây dựng kế hoạch chăm sóc phù hợp với từng người. Bác sĩ sẽ xem xét triệu chứng, tình trạng sức khỏe, tiền sử bệnh, nhu cầu và ưu tiên cá nhân của bạn để cùng bạn lựa chọn ra hướng chăm sóc phù hợp.',
    order: 3,
  },
]

const CARE_VALUES = [
  {
    letter: 'C',
    name: 'Companionship (Đồng hành)',
    body: 'Tại VMC, hành trình chăm sóc không kết thúc sau một buổi tư vấn hay một đợt điều trị. Chúng tôi đồng hành cùng bạn trong suốt quá trình chăm sóc sức khỏe nội tiết, từ việc giúp bạn hiểu rõ hơn những thay đổi của cơ thể, theo dõi quá trình trị liệu đến điều chỉnh lộ trình khi cần, để mỗi giai đoạn đều có sự đồng hành phù hợp và đáng tin cậy.',
  },
  {
    letter: 'A',
    name: 'Adaptive Care (Cá nhân hóa)',
    body: 'Chúng tôi hiểu rằng cơ thể mỗi người phụ nữ là một nhịp điệu rất riêng. Vì vậy, VMC kết hợp công nghệ AI, dữ liệu sức khỏe và chuyên môn của đội ngũ bác sĩ để xây dựng lộ trình chăm sóc phù hợp, đồng thời linh hoạt điều chỉnh theo những thay đổi của cơ thể ở từng giai đoạn.',
  },
  {
    letter: 'R',
    name: 'Reliable Science (Đáng tin cậy y khoa)',
    body: 'Chúng tôi tin rằng sự an tâm bắt đầu từ những thông tin đáng tin cậy. Vì vậy, mọi tư vấn và lộ trình chăm sóc tại VMC đều được xây dựng trên nền tảng y khoa, các phác đồ điều trị tiêu chuẩn quốc tế cùng với chuyên môn của đội ngũ bác sĩ, để bạn hiểu hơn về cơ thể và tự tin trong từng quyết định chăm sóc sức khỏe.',
  },
  {
    letter: 'E',
    name: 'Empathy (Thấu cảm)',
    body: 'Tại VMC, sự chăm sóc bắt đầu từ việc lắng nghe. Chúng tôi hiểu rằng những thay đổi về nội tiết không chỉ ảnh hưởng đến cơ thể, mà còn tác động đến cảm xúc, tâm lý và chất lượng cuộc sống của mỗi phụ nữ. Vì vậy, VMC xây dựng một không gian chăm sóc an toàn, riêng tư và không phán xét, nơi phụ nữ được chia sẻ, được thấu hiểu và được hỗ trợ theo cách phù hợp nhất với mình.',
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

  // 7. Câu hỏi thường gặp
  for (const faq of FAQS) {
    const existing = await payload.find({
      collection: 'faqs',
      where: { question: { equals: faq.question } },
      limit: 1,
    })

    const data = { question: faq.question, answer: toLexical(faq.answer), order: faq.order }

    if (existing.docs[0]) {
      await payload.update({ collection: 'faqs', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'faqs', data })
    }
  }
  payload.logger.info(`Câu hỏi thường gặp: ${FAQS.length}`)

  // 8. Các trang còn lại
  await upsert(payload, 'pages', 'slug', 've-vmc', {
    title: 'Về VMC',
    metaDescription: 'Sứ mệnh, tầm nhìn và triết lý CARE của Vietnamese Menopause Center.',
    _status: 'published',
    layout: [
      {
        blockType: 'banner',
        heading: 'Về VMC',
        lead: 'Tại VMC, chúng tôi kết hợp công nghệ AI, các phác đồ điều trị theo tiêu chuẩn quốc tế và chuyên môn của đội ngũ bác sĩ để xây dựng lộ trình chăm sóc sức khỏe nội tiết được cá nhân hóa cho từng người.',
      },
      {
        blockType: 'richText',
        heading: 'Sứ mệnh và tầm nhìn',
        background: 'none',
        content: toLexical(
          '### Sứ mệnh\n\nVMC đồng hành cùng phụ nữ chủ động kiểm soát sức khỏe nội tiết thông qua nền tảng chăm sóc cá nhân hóa kết hợp giữa y khoa, công nghệ và đội ngũ chuyên gia, giúp họ duy trì sự cân bằng về thể chất và tinh thần, nuôi dưỡng nguồn năng lượng tích cực và tận hưởng cuộc sống một cách trọn vẹn.\n\n### Tầm nhìn\n\nTrở thành nền tảng chăm sóc sức khỏe tiền mãn kinh và mãn kinh hàng đầu tại Việt Nam, tiên phong kiến tạo hệ sinh thái chăm sóc toàn diện, giúp phụ nữ chủ động kiểm soát sức khỏe, duy trì sự cân bằng, sống khỏe và tự tin hơn mỗi ngày.',
        ),
      },
      {
        blockType: 'careModel',
        heading: 'Giá trị cốt lõi',
        subheading: 'CARE - Cam kết đồng hành cùng phụ nữ từ sự thấu hiểu',
        intro: toLexical(
          'Đôi khi, có những thay đổi đến rất khẽ. Đó là một giấc ngủ không còn trọn vẹn. Một ngày bỗng thấy cơ thể thiếu năng lượng. Hay đôi lúc, cảm xúc trở nên nhạy cảm hơn mà chính mình cũng chưa hiểu vì sao.\n\nNhững thay đổi ấy không phải lúc nào cũng dễ nhận ra, nhưng đều xứng đáng được lắng nghe và thấu hiểu.\n\nVới VMC, mỗi hành trình chăm sóc luôn bắt đầu từ đó. Từ sự quan tâm đủ tinh tế để nhận ra những tín hiệu nhỏ của cơ thể, kết hợp cùng nền tảng y khoa đáng tin cậy, công nghệ hiện đại và lộ trình chăm sóc được cá nhân hóa. Đó cũng là tinh thần được gửi gắm trong triết lý CARE.',
        ),
        values: CARE_VALUES,
      },
    ],
  })

  await upsert(payload, 'pages', 'slug', 'chuong-trinh', {
    title: 'Chương trình chăm sóc tại VMC',
    metaDescription:
      'VMC Care Program: lợi ích, các gói chăm sóc và thời gian tham gia chương trình.',
    _status: 'published',
    layout: [
      { blockType: 'banner', heading: 'Chương trình chăm sóc tại VMC' },
      {
        blockType: 'richText',
        heading: 'Những lợi ích bạn nhận được',
        background: 'none',
        content: toLexical(
          'Mỗi hành trình chăm sóc tại VMC đều được thiết kế với mong muốn giúp bạn không chỉ cải thiện sức khỏe nội tiết, mà còn chủ động gìn giữ sự cân bằng và chất lượng cuộc sống lâu dài. Đó là những giá trị mà chúng tôi muốn gửi gắm thông qua VMC Care Program:\n\n- **Sự thấu hiểu rõ hơn về cơ thể**, giúp bạn nhận biết và chủ động trước những thay đổi của sức khỏe nội tiết.\n- **Lộ trình chăm sóc được cá nhân hóa**, phù hợp với tình trạng sức khỏe, nhu cầu và mục tiêu riêng của từng người.\n- **Sự đồng hành xuyên suốt từ đội ngũ bác sĩ và chuyên gia**, luôn theo dõi sát sao và điều chỉnh lộ trình chăm sóc phù hợp với từng giai đoạn.\n- **Phác đồ điều trị tuân theo tiêu chuẩn quốc tế**, kết hợp công nghệ hiện đại để hỗ trợ quá trình theo dõi và chăm sóc.\n- **Cam kết thuốc chính hãng được chuẩn bị theo đúng lộ trình và giao tận nhà định kỳ**, giúp bạn duy trì quá trình điều trị thuận tiện, liên tục và an tâm hơn.\n- **Sự cân bằng về thể chất, cảm xúc và chất lượng cuộc sống**, giúp bạn tự tin bước qua từng giai đoạn với sự an tâm và chủ động.',
        ),
      },
      {
        blockType: 'plans',
        heading: 'Các gói chăm sóc tại VMC',
        intro:
          'Mỗi người phụ nữ có một nhu cầu riêng, và việc chăm sóc cũng vậy. VMC ở đây để bạn có thể bắt đầu từ những điều nhỏ nhất, lắng nghe cơ thể và tìm ra cách chăm sóc phù hợp với mình.',
      },
      {
        blockType: 'richText',
        heading: 'VMC Care Program kéo dài bao lâu?',
        background: 'tint',
        content: toLexical(
          'Thực tế, không có một khoảng thời gian cố định dành cho tất cả mọi người. Bởi mỗi cơ thể có mức độ triệu chứng, tình trạng sức khỏe và mục tiêu điều trị khác nhau, nên lộ trình cũng được xây dựng và điều chỉnh phù hợp với từng người.\n\nPhần lớn phụ nữ bắt đầu cảm nhận những thay đổi tích cực **sau khoảng 4-8 tuần**. Tuy nhiên, cơ thể mỗi người có một nhịp đáp ứng riêng. Có người cảm nhận sớm hơn, có người cần thêm thời gian để đạt được hiệu quả ổn định. Trong suốt quá trình này, đội ngũ bác sĩ tại VMC sẽ theo dõi định kỳ, đánh giá mức độ đáp ứng và điều chỉnh phác đồ điều trị phù hợp, bao gồm cân nhắc thời điểm tiếp tục, giảm liều hoặc ngừng điều trị.\n\nĐiều mà VMC chúng tôi hướng đến không phải là điều trị càng lâu càng tốt mà là giúp bạn kiểm soát triệu chứng hiệu quả, an toàn và duy trì chất lượng cuộc sống tốt nhất trong từng giai đoạn của hành trình mãn kinh.',
        ),
      },
    ],
  })

  await upsert(payload, 'pages', 'slug', 'kien-thuc', {
    title: 'Thư viện kiến thức',
    metaDescription:
      'Kiến thức về tiền mãn kinh và mãn kinh: triệu chứng thường gặp, chăm sóc sức khỏe mỗi ngày và các chủ đề tổng hợp.',
    _status: 'published',
    layout: [
      { blockType: 'banner', heading: 'Thư viện kiến thức' },
      {
        blockType: 'articleList',
        heading: 'Triệu chứng thường gặp',
        category: categoryIds['trieu-chung'],
        limit: 3,
        linkLabel: 'Xem tất cả bài triệu chứng',
        linkHref: '/kien-thuc/trieu-chung',
      },
      {
        blockType: 'articleList',
        heading: 'Chăm sóc sức khỏe',
        category: categoryIds['cham-soc'],
        limit: 3,
        linkLabel: 'Xem tất cả bài chăm sóc sức khỏe',
        linkHref: '/kien-thuc/cham-soc',
      },
      {
        blockType: 'articleList',
        heading: 'Tổng hợp',
        category: categoryIds['tong-hop'],
        limit: 3,
        linkLabel: 'Xem tất cả bài tổng hợp',
        linkHref: '/kien-thuc/tong-hop',
      },
    ],
  })

  await upsert(payload, 'pages', 'slug', 'dong-hanh', {
    title: 'Đồng hành cùng VMC',
    metaDescription:
      'Câu hỏi thường gặp, đặt lịch tư vấn cùng bác sĩ và thông tin liên hệ của VMC.',
    _status: 'published',
    layout: [
      { blockType: 'banner', heading: 'Đồng hành cùng VMC' },
      { blockType: 'faqBlock', heading: 'Câu hỏi thường gặp' },
      {
        blockType: 'richText',
        heading: 'Thông tin liên hệ',
        background: 'none',
        content: toLexical(
          '- Số điện thoại: +84 903 933 922\n- Email: vmc@tma.com.vn\n\nĐịa chỉ phòng khám đang được cập nhật.',
        ),
      },
    ],
  })
  payload.logger.info('Đã cập nhật 4 trang nội dung')

  // 9. Trang pháp lý: để nháp vì chưa có nội dung, không xuất bản trang trống
  for (const legal of [
    { slug: 'chinh-sach-bao-mat', title: 'Chính sách bảo mật' },
    { slug: 'dieu-khoan', title: 'Điều khoản sử dụng' },
  ]) {
    await upsert(payload, 'pages', 'slug', legal.slug, {
      title: legal.title,
      _status: 'draft',
      layout: [
        { blockType: 'banner', heading: legal.title },
        {
          blockType: 'richText',
          background: 'none',
          content: toLexical(
            'Nội dung đang được chuẩn bị. Trang này phải có nội dung trước khi website go-live.',
          ),
        },
      ],
    })
  }
  payload.logger.info('Đã tạo 2 trang pháp lý ở trạng thái nháp')

  process.exit(0)
}

void seed()
