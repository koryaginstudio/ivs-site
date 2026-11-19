// Обёртка для `next dev`: превью-раннер Kimi передаёт `--host`,
// а CLI Next 16 понимает только `--hostname`. Конвертируем флаг,
// остальные аргументы (--port и пр.) передаём как есть.
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const nextBin = require.resolve('next/dist/bin/next')

const args = process.argv.slice(2)
const forwarded = []
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if (arg === '--host') {
    forwarded.push('--hostname')
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      forwarded.push(args[i + 1])
      i += 1
    }
  } else if (arg.startsWith('--host=')) {
    forwarded.push('--hostname=' + arg.slice('--host='.length))
  } else {
    forwarded.push(arg)
  }
}

const child = spawn(process.execPath, [nextBin, 'dev', ...forwarded], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
