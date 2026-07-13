/**
 * 乡音记 · 方言翻译工具
 * 基于方言词典，通过正则全局替换实现方言⇄普通话互译，
 * 并收集被替换的词语作为注释标签。
 */
import { dialectDict } from '../data'
import type { DialectDictEntry } from '../data'

/** 一条注释：被替换的原文与替换后的译文 */
export interface TranslateNote {
  /** 原文词 */
  original: string
  /** 译文词 */
  replacement: string
}

/** 翻译结果 */
export interface TranslateResult {
  /** 译文 */
  translated: string
  /** 被替换的词语注释标签 */
  notes: TranslateNote[]
}

/** 翻译方向 */
export type TranslateDirection = 'dialect' | 'mandarin'

/**
 * 转义正则特殊字符，用于把任意字符串安全地转为正则字面量。
 */
function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 核心翻译函数：遍历词典，把 from 字段的词替换为 to 字段的词。
 * 按词长降序排列，避免短词先匹配导致长词被破坏。
 * 收集所有被替换的 (原文, 译文) 作为注释。
 */
function translate(
  text: string,
  from: TranslateDirection,
  to: TranslateDirection,
): TranslateResult {
  let result = text
  const notes: TranslateNote[] = []

  // 按源词长度降序，优先匹配长词
  const sorted: DialectDictEntry[] = [...dialectDict].sort(
    (a, b) => b[from].length - a[from].length,
  )

  for (const entry of sorted) {
    const source = entry[from]
    const target = entry[to]
    if (!source || !target || source === target) continue

    // 仅当原文中确实包含该词时才进行替换与记录
    if (result.includes(source)) {
      const re = new RegExp(escapeRegExp(source), 'g')
      result = result.replace(re, target)
      notes.push({ original: source, replacement: target })
    }
  }

  return { translated: result, notes }
}

/**
 * 方言 → 普通话：把方言词替换为普通话词。
 */
export function translateDialectToMandarin(text: string): TranslateResult {
  return translate(text, 'dialect', 'mandarin')
}

/**
 * 普通话 → 方言：把普通话词替换为方言词。
 */
export function translateMandarinToDialect(text: string): TranslateResult {
  return translate(text, 'mandarin', 'dialect')
}
