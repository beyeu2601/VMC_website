import type { Access } from 'payload'

/**
 * Khách vãng lai chỉ thấy bản đã xuất bản; người đăng nhập admin thấy tất cả.
 */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
