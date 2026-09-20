import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'

export const SiteFooter = async () => {
  const payload = await getPayloadClient()
  const [footer, settings] = await Promise.all([
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__cols">
          <div>
            <p>
              <strong>{settings?.siteName ?? 'VMC'}</strong>
            </p>
            {settings?.tagline && <p>{settings.tagline}</p>}
            {settings?.phone && <p>{settings.phone}</p>}
            {settings?.email && <p>{settings.email}</p>}
          </div>

          {(footer?.columns ?? []).map((column) => (
            <div key={column.id ?? column.heading}>
              {column.heading && <p><strong>{column.heading}</strong></p>}
              <ul>
                {(column.links ?? []).map((item) => (
                  <li key={item.id ?? item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer__bottom">
          {settings?.medicalDisclaimer && <p>{settings.medicalDisclaimer}</p>}
          {footer?.copyright && <p>{footer.copyright}</p>}
        </div>
      </div>
    </footer>
  )
}
