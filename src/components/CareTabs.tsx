'use client'

import { useRef, useState } from 'react'

type CareValue = {
  id?: string | null
  letter: string
  name: string
  body: string
}

/**
 * Tab C/A/R/E theo yêu cầu ở pages/02-ve-vmc.md: mặc định chỉ hiện 4 chữ,
 * chọn một chữ mới hiện nội dung. Điều hướng được bằng phím mũi tên.
 */
export const CareTabs = ({ values }: { values: CareValue[] }) => {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = (index: number) => {
    const next = (index + values.length) % values.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusTab(index + 1)
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusTab(index - 1)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusTab(0)
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusTab(values.length - 1)
    }
  }

  return (
    <div className="care">
      <div className="care__tabs" role="tablist" aria-label="Giá trị cốt lõi CARE">
        {values.map((value, index) => (
          <button
            aria-controls={`care-panel-${index}`}
            aria-selected={index === active}
            className="care__tab"
            id={`care-tab-${index}`}
            key={value.id ?? value.letter}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            role="tab"
            tabIndex={index === active ? 0 : -1}
            type="button"
          >
            <span className="care__letter">{value.letter}</span>
            <span className="care__name">{value.name}</span>
          </button>
        ))}
      </div>

      {values.map((value, index) => (
        <div
          aria-labelledby={`care-tab-${index}`}
          className="care__panel"
          hidden={index !== active}
          id={`care-panel-${index}`}
          key={`panel-${value.id ?? value.letter}`}
          role="tabpanel"
          tabIndex={0}
        >
          <h3>{value.name}</h3>
          <p>{value.body}</p>
        </div>
      ))}
    </div>
  )
}
