import format from "date-format"

// Sync with functions/src/utils/date.ts

// see https://stackoverflow.com/a/39466341/9764345
function addDateOrdinality(n: number) {
  return n.toString() + (["st", "nd", "rd"][((((n + 90) % 100) - 10) % 10) - 1] || "th")
}

export interface LocaleDateStrings {
  day: string
  month: string
  year: string
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function getLocaleDateStrings(date: Date): LocaleDateStrings {
  return {
    day: addDateOrdinality(date.getDate()),
    month: MONTHS[date.getMonth()],
    year: date.getFullYear().toString(),
  }
}

export function getFormattedPeriod(dateStart: Date, dateEnd: Date): string {
  const start = getLocaleDateStrings(dateStart)
  const end = getLocaleDateStrings(dateEnd)
  return `${start.month} ${start.day} - ${start.month !== end.month ? end.month + " " : ""}${end.day}, ${end.year}`
}

/** Returns "DD-MM-YYYY" */
export function dateToString(date: Date): string {
  return format("dd-MM-yyyy", date)
}

function convertTimezone(date: Date, fromTimezone: Timezone, toTimezone: Timezone) {
  if (fromTimezone !== toTimezone) {
    if (toTimezone === "UTC+2") {
      // local -> UTC+2
      // local + offset = UTC
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 120)
    } else {
      // UTC+2 -> local
      date.setMinutes(date.getMinutes() - 120 - date.getTimezoneOffset())
    }
  }
  return date
}

/** Returns "hh:mm" */
export function timeToString(date: Date, fromTimezone: Timezone = "local", toTimezone: Timezone = "local"): string {
  const _date = new Date(date)
  convertTimezone(_date, fromTimezone, toTimezone)
  return format("hh:mm", _date)
}

/** Returns "DD-MM-YYYY hh:mm" */
export function datetimeToString(date: Date, fromTimezone: Timezone = "local", toTimezone: Timezone = "local"): string {
  return dateToString(date) + " " + timeToString(date, fromTimezone, toTimezone)
}

/** Parses "DD-MM-YYYY" */
export function parseDate(date: string): Date {
  if (!date) return null
  try {
    const result: Date = format.parse("dd-MM-yyyy", date)
    result.setHours(0, 0, 0, 0)
    return result
  } catch (_) {
    try {
      const result: Date = format.parse("yyyy-MM-dd", date)
      result.setHours(0, 0, 0, 0)
      return result
    } catch (__) {
      return null
    }
  }
}

export type Timezone = "UTC+2" | "local"

/** Parses "hh:mm" */
export function parseTime(time: string, fromTimezone: Timezone = "local", toTimezone: Timezone = "local"): Date {
  const result = format.parse("hh:mm", time)
  convertTimezone(result, fromTimezone, toTimezone)
  return result
}

/** Parses "DD-MM-YYYY hh:mm" expected to be in UTC+2*/
export function parseDatetime(
  datetime: string,
  fromTimezone: Timezone = "local",
  toTimezone: Timezone = "local"
): Date {
  try {
    return convertTimezone(format.parse("dd-MM-yyyy hh:mm", datetime), fromTimezone, toTimezone)
  } catch (_) {
    return convertTimezone(format.parse("yyyy-MM-ddThh:mm", datetime), fromTimezone, toTimezone)
  }
}

const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365.25

const MINUTES_IN_MS = 1000 * 60

export function getAge(date: Date, now: Date = new Date()): number {
  const ageAtStartInMilliseconds = now.getTime() - date.getTime()
  return Math.floor(ageAtStartInMilliseconds / YEAR_IN_MS)
}

export function getDuration(start: Date, end: Date): number {
  const timeDifference = end.getTime() - start.getTime()
  return Math.floor(timeDifference / MINUTES_IN_MS)
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Returns Day, Month DD, YEAR (Thu, Jun 5, 2020) */
export function dateToFormattedString(date: Date): string {
  const converted = new Date(date)
  const day = DAYS_SHORT[converted.getDay()]
  const month = MONTHS_SHORT[converted.getMonth()]
  return `${day}, ${month} ${converted.getDate()}, ${converted.getFullYear()}`
}
