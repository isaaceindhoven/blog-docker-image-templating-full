import chalk from "chalk"

export class Logger {
  success(message, ...data) {
    console.log(chalk.green("✔ "), message, ...data)
  }

  fail(message, ...data) {
    console.error(chalk.red("✖ "), message, ...data)
  }

  error(message, ...data) {
    this.fail(chalk.red("Error: "), message, ...data)
  }
}
