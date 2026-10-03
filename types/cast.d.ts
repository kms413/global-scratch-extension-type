/**
 * @fileoverview
 * Utilities for casting and comparing Scratch data-types.
 * Scratch behaves slightly differently from JavaScript in many respects,
 * and these differences should be encapsulated below.
 * For example, in Scratch, add(1, join("hello", world")) -> 1.
 * This is because "hello world" is cast to 0.
 * In JavaScript, 1 + Number("hello" + "world") would give you NaN.
 * Use when coercing a value before computation.
 */

class Cast {
  /**
   * Scratch cast to number.
   * Treats NaN as 0.
   * In Scratch 2.0, this is captured by `interp.numArg.`
   * @param val Value to cast to number.
   * @returns The Scratch-casted number value.
   */
  static toNumber(val: any): number

  /**
   * Scratch cast to boolean.
   * In Scratch 2.0, this is captured by `interp.boolArg.`
   * Treats some string values differently from JavaScript.
   * @param val Value to cast to boolean.
   * @returns The Scratch-casted boolean value.
   */
  static toBoolean(val: any): boolean

  /**
   * Scratch cast to string.
   * @param val Value to cast to string.
   * @returns The Scratch-casted string value.
   */
  static toString(val: any): string

  /**
   * Cast any Scratch argument to an RGB color array to be used for the renderer.
   * @param val Value to convert to RGB color array.
   * @returns [r,g,b], values between 0-255.
   */
  static toRgbColorList(val: any): [
    r: number,
    g: number,
    b: number
  ]

  /**
   * Cast any Scratch argument to an RGB color object to be used for the renderer.
   * @param val Value to convert to RGB color object.
   * @returns [r,g,b], values between 0-255.
   */
  static toRgbColorObject(val: any): {
    r: number,
    g: number,
    b: number,
  }

  /**
   * Determine if a Scratch argument is a white space string (or null / empty).
   * @param val value to check.
   * @returns True if the argument is all white spaces or null / empty.
   */
  static isWhiteSpace(val: any): boolean

  /**
   * Compare two values, using Scratch cast, case-insensitive string compare, etc.
   * In Scratch 2.0, this is captured by `interp.compare.`
   * @param v1 First value to compare.
   * @param v2 Second value to compare.
   * @returns Negative number if v1 < v2; 0 if equal; positive otherwise.
   */
  static compare(v1: any, v2: any): number

  /**
   * Determine if a Scratch argument number represents a round integer.
   * @param val Value to check.
   * @returns True if number looks like an integer.
   */
  static isInt(val: any): boolean

  /**
   * Special value indicating an invalid list index.
   */
  static get LIST_INVALID(): "INVALID"

  /**
   * Special value indicating a list block refers to all items.
   */
  static get LIST_ALL(): "ALL"

  /**
   * Compute a 1-based index into a list, based on a Scratch argument.
   * Two special cases may be returned:
   * LIST_ALL: if the block is referring to all of the items in the list.
   * LIST_INVALID: if the index was invalid in any way.
   * @param index Scratch arg, including 1-based numbers or special cases.
   * @param length Length of the list.
   * @param acceptAll Whether it should accept "all" or not.
   * @returns 1-based index for list, LIST_ALL, or LIST_INVALID.
   */
  static toListIndex(
    index: unknown,
    length: number,
    acceptAll: boolean
  ): number | string
}

export default Cast