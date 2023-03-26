import type { H3Event } from 'h3'
import semverLt from 'semver/functions/lt.js'
import semverMajor from 'semver/functions/major.js'
import semverMinor from 'semver/functions/minor.js'
import semverValid from 'semver/functions/valid.js'
import { errorResponse } from '@/logic/response'

export interface RangeContext {
  startTag: string
  endTag: string
}

export function versionToBranch(version: string): string {
  const major = semverMajor(version)
  const minor = major >= 6 ? 'x' : semverMinor(version)
  return `${major}.${minor}`
}

export function response(event: H3Event, content: (range: RangeContext) => string) {
  event.node.res.setHeader('Content-Type', 'text/plain; charset=UTF-8')

  const range = event.context.params?.range.split('...') as string[]
  if (range.length !== 2) {
    return errorResponse('Range is incorrect.')
  }
  const [startTag, endTag] = range

  if (!semverValid(startTag)) {
    return errorResponse('startTag is invalid.')
  }
  if (!semverValid(endTag)) {
    return errorResponse('endTag is invalid.')
  }
  if (!semverLt(startTag, endTag)) {
    return errorResponse('startTag must be less than endTag.')
  }

  return content({ startTag, endTag })
}
