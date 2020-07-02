import React from "react"

/**
 * We split this theme in 3 instead of using `disabled:xxx` because links cannot have the disabled variant.
 */
export interface ButtonTheme {
  all: string
  enabled: string
  disabled: string
}

export interface ButtonsTheme {
  primary: ButtonTheme
  secondary: ButtonTheme
  danger: ButtonTheme
  link: ButtonTheme
  icon: ButtonTheme
}

export interface FieldTheme {
  wrapper: string
  label: string
  hint: string
  // placeholder: string
  error: string
}

export interface ControlTheme {
  raw: string
  focused: string
  disabled: string
  error: string
}

export interface FormTheme {
  field: FieldTheme
  control: ControlTheme
  error: string
}

export interface HeadingTheme {
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
}

export interface TabsTheme {
  all: string
  selected: string
  unselected: string
  disabled: string
  selectedDisabled: string
}

export interface Theme {
  root: string
  buttons: ButtonsTheme
  form: FormTheme
  heading: HeadingTheme
  tabs: TabsTheme
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type PartialTheme = DeepPartial<Theme>

export const DEFAULT_THEME: Theme = {
  root: "",
  buttons: {
    primary: {
      all: "text-white font-bold py-2 px-4 rounded inline-block",
      enabled: "bg-orange-600 hover:bg-orange-800 focus:shadow-outline",
      disabled: "bg-orange-400 cursor-not-allowed",
    },
    secondary: {
      all: "text-white font-bold py-2 px-4 rounded inline-block",
      enabled: "bg-gray-600 hover:bg-gray-700 focus:shadow-outline",
      disabled: "bg-gray-400 cursor-not-allowed",
    },
    danger: {
      all: "text-white font-bold py-2 px-4 rounded inline-block",
      enabled: "bg-red-600 hover:bg-red-800 focus:shadow-outline",
      disabled: "bg-red-400 cursor-not-allowed",
    },
    link: {
      all: "",
      enabled: "hover:underline focus:underline text-orange-700 hover:text-orange-700",
      disabled: "cursor-not-allowed text-gray-500",
    },
    icon: {
      all: "text-gray-700",
      enabled: "hover:text-orange-800",
      disabled: "text-gray-700 opacity-50 cursor-not-allowed",
    },
  },
  form: {
    field: {
      wrapper: "block mb-4",
      label: "block font-bold mb-2",
      error: "text-red-700 text-sm",
      hint: "text-gray-600 text-sm",
    },
    control: {
      raw:
        "appearance-none w-full py-2 px-3 border rounded leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200",
      disabled: "bg-gray-200 cursor-disabled",
      error: "border-red-500",
      focused: "outline-none shadow-outline",
    },
    error: "text-red-700 text-lg mr-4",
  },
  heading: {
    h1: "text-5xl font-heading leading-tight",
    h2: "text-4xl font-heading leading-tight",
    h3: "text-3xl font-heading leading-snug",
    h4: "text-2xl font-heading leading-snug",
    h5: "text-xl font-heading leading-normal",
    h6: "text-lg font-heading leading-normal",
  },
  tabs: {
    all: "no-underline text-sm tracking-wide font-normal py-3 px-2 sm:px-4",
    selected: "text-orange-700 font-semibold",
    unselected: "text-gray-800",
    disabled: "text-gray-400",
    selectedDisabled: "text-orang-400",
  },
}

function deepMerge<T>(value: T, partial: DeepPartial<T>) {
  if (typeof value === "object") {
    const result: any = {}

    Object.keys(value).forEach((key) => {
      result[key] = typeof partial[key] !== "undefined" ? deepMerge<any>(value[key], partial[key]) : value[key]
    })

    return result
  }
  return typeof partial !== "undefined" ? partial : value
}

export function mergeThemes(theme: Theme, partial: PartialTheme): Theme {
  return deepMerge(theme, partial)
}

const ThemeContext = React.createContext(DEFAULT_THEME)

export interface ThemeProviderProps {
  theme?: Theme
  children?: any
}

export function ThemeProvider(props: ThemeProviderProps) {
  const theme = props.theme || DEFAULT_THEME
  return (
    <ThemeContext.Provider value={theme}>
      <div className={theme.root}>{props.children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme(): Theme {
  return React.useContext(ThemeContext)
}
