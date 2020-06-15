/** Mappings between our props and tailwindcss' classnames */
const MAPPINGS = {
  borderRadius: {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
  objectFit: {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  },
  italic: {
    true: "italic",
    false: "not-italic",
  },
}

export function getUnresponsiveFromPropName(props: any, propName: string): string {
  return getUnresponsiveFromPropValue(props[propName], propName)
}

export function getUnresponsiveFromPropValue(propValue: any, propName: string) {
  const classNames = MAPPINGS[propName]
  if (!propValue || !classNames) {
    return ""
  }
  return classNames[String(propValue || "")] || ""
}
