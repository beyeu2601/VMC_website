import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin, isAdminField, roleOptions } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Hệ thống',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    // Chỉ admin quản lý tài khoản; người khác chỉ thao tác trên chính mình
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole('admin')(user)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole('admin')(user)) return true
      return { id: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: roleOptions,
      access: {
        // Không ai tự nâng quyền cho chính mình
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description: 'Editor soạn nội dung, Clinical reviewer duyệt y khoa, Care team xử lý lead.',
      },
    },
  ],
}
