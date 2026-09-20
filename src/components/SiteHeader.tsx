import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'

export const SiteHeader = async () => {
  const payload = await getPayloadClient()
  const [header, settings] = await Promise.all([
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const items = header?.items ?? []

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-header__brand" href="/">
          {settings?.siteName ?? 'VMC'}
        </Link>

        <nav className="nav" aria-label="Điều hướng chính">
          <ul className="nav__list">
            {items.map((item) => (
              <li className="nav__item" key={item.id ?? item.href}>
                <Link className="nav__link" href={item.href}>
                  {item.label}
                </Link>
                {item.children && item.children.length > 0 && (
                  <ul className="nav__sub">
                    {item.children.map((child) => (
                      <li key={child.id ?? child.href}>
                        <Link href={child.href}>{child.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {header?.ctaLabel && header?.ctaHref && (
            <Link className="btn btn--primary" href={header.ctaHref}>
              {header.ctaLabel}
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
