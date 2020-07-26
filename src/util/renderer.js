import nunjucks from "nunjucks"
import { read } from "./file.js"

/**
 * Prepares a template by reading it and compiling it with Nunjucks.
 *
 * @param file The file path of the template to prepare
 */
export async function prepare(file) {
  const rawTemplate = await read(file)
  return nunjucks.compile(rawTemplate)
}

// Function that removes any tripple newlines and replaces them with two
function removeExcessiveWhitespace(string) {
  return string.replace(/[\r\n]{3,}/g, "\n\n")
}

/**
 * Promisified version of the nunjucks.render method to render a precompiled template
 * given a certain context. Also removes any excessive whitespace that's the result of
 * rendering the template.
 *
 * @param template The prepared template from the prepare method
 * @param context The context with which to render the template
 */
export async function render(template, context) {
  return new Promise((resolve, reject) => {
    nunjucks.render(template, context, function(error, result) {
      if (error) {
        reject(error)
      }

      resolve(removeExcessiveWhitespace(result))
    })
  })
}
