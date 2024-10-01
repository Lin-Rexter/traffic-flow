'use client'
import { FiSun, FiMoon } from "react-icons/fi"
import { FaRegSun } from 'react-icons/fa'
import { BsFillMoonStarsFill } from "react-icons/bs"
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Image from "next/image"

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return (
    <Image
      src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIyIiB5PSIyIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSIyIj48L3JlY3Q+PC9zdmc+Cg=="
      fill={false}
      sizes="36x36"
      alt="Loading Light/Dark Toggle"
      priority={false}
      title="Loading Light/Dark Toggle"
      width='36'
      height= '36'
      style={{
        objectFit: 'contain', // cover, contain, none
      }}
    />
  )

  if (resolvedTheme === 'dark') {
    return <BsFillMoonStarsFill onClick={() => setTheme('light')} />
  }

  if (resolvedTheme === 'light') {
    return <FaRegSun onClick={() => setTheme('dark')} />
  }
}

export default ThemeSwitch;