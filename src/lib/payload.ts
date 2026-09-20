import { getPayload } from 'payload'
import config from '@/payload.config'

export const getPayloadClient = async () => getPayload({ config: await config })

/** Locale mặc định của site. Tiếng Anh sẽ thêm khi có nội dung. */
export const DEFAULT_LOCALE = 'vi' as const
