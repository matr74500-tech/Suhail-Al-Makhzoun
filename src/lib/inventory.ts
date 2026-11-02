export function makeEan13() {
  const base = `628${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)
  return `${base}${(10 - (sum % 10)) % 10}`
}

export function isValidEan13(value: string) {
  if (!/^\d{13}$/.test(value)) return false
  const sum = [...value.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)
  return (10 - (sum % 10)) % 10 === Number(value[12])
}

export function makeItemCode(category: string, codes: string[]) {
  const prefix = Array.from(category.trim()).slice(0, 3).join('').toUpperCase() || 'صنف'
  const sequence = codes.reduce((max, code) => {
    const match = code.match(/-(\d+)$/)
    return code.startsWith(`${prefix}-`) && match ? Math.max(max, Number(match[1])) : max
  }, 0) + 1
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111']
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
const parity = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

export function ean13Bits(value: string) {
  const code = /^\d{13}$/.test(value) ? value : makeEan13()
  let bits = '101'
  for (let i = 1; i <= 6; i++) bits += (parity[Number(code[0])][i - 1] === 'L' ? L : G)[Number(code[i])]
  bits += '01010'
  for (let i = 7; i < 13; i++) bits += R[Number(code[i])]
  return `${bits}101`
}
