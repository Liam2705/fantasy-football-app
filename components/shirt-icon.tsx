interface ShirtIconProps {
  color?: string
  className?: string
}

export function ShirtIcon({ color = '#94a3b8', className }: ShirtIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 2L22 6L19 9H17V20H7V9H5L2 6L8 2C8 3.1 9.8 4 12 4C14.2 4 16 3.1 16 2Z" />
    </svg>
  )
}
