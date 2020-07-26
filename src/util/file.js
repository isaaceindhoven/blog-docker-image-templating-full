import { promises as fs } from "fs"
import { dirname } from "path"

/**
 * Basic function to read a file
 *
 * @param file The file path to read
 */
export async function read(file) {
  return fs.readFile(file, "utf-8")
}

/**
 * Basic function to write a file that also ensures the directory exists
 *
 * @param file The file path to write to
 * @param contents The contents to write to the file
 */
export async function write(file, contents) {
  const directory = dirname(file)
  await fs.mkdir(directory, { recursive: true })
  return fs.writeFile(file, contents, "utf-8")
}
