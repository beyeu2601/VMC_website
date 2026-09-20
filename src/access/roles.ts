import type { Access, FieldAccess } from 'payload'
import type { User } from '../payload-types'

export type Role = 'admin' | 'editor' | 'clinical-reviewer' | 'care-team'

export const roleOptions: { label: string; value: Role }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor (marketing)', value: 'editor' },
  { label: 'Clinical reviewer (bác sĩ)', value: 'clinical-reviewer' },
  { label: 'Care team', value: 'care-team' },
]

const roleOf = (user: unknown): Role | undefined => (user as User | undefined)?.role as Role | undefined

export const hasRole =
  (...roles: Role[]) =>
  (user: unknown): boolean => {
    const role = roleOf(user)
    return role ? roles.includes(role) : false
  }

export const isAdmin: Access = ({ req: { user } }) => hasRole('admin')(user)

/** Nội dung: editor soạn, clinical reviewer duyệt, admin toàn quyền */
export const canEditContent: Access = ({ req: { user } }) =>
  hasRole('admin', 'editor', 'clinical-reviewer')(user)

/** Dữ liệu người dùng gửi lên (lead, kết quả đánh giá) */
export const canHandleLeads: Access = ({ req: { user } }) => hasRole('admin', 'care-team')(user)

/** Ai đăng nhập vào admin cũng đọc được nội dung */
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole('admin')(user)

export const isClinicalReviewerField: FieldAccess = ({ req: { user } }) =>
  hasRole('admin', 'clinical-reviewer')(user)
