import { create } from "nano-css"
import { addon as addonCache } from "nano-css/addon/cache"
import { addon as addonDrule } from "nano-css/addon/drule"
import { addon as addonRule } from "nano-css/addon/rule"

const nano = create()
addonCache(nano)
addonRule(nano)
addonDrule(nano)

export { nano }
