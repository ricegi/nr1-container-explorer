import bytesToSize from './bytes-to-size'

const MEGABYTE = 1024*1024
const GIGABYTE = MEGABYTE*1024
const PLOTS = [
  {
    select: 'average(cpuPercent) AS cpu',
    title: "CPU (Avg)",
    formatValue: (value) => `${value.toFixed(1)}%`,
    max: (max) => Math.ceil(max/100)*100,
  },
  {
    select: 'average(memoryResidentSizeBytes) AS memory',
    title: "Memory (Avg)",
    formatValue: (value) => bytesToSize(value),
    max: (max) => Math.ceil(max / GIGABYTE)*GIGABYTE
  },
  {
    select: 'average(ioReadBytesPerSecond+ioWriteBytesPerSecond) AS io',
    title: "Disk I/O (Avg)",
    formatValue: (value) => `${bytesToSize(value)}/s`,
    max: (max) => Math.ceil(max / MEGABYTE)*MEGABYTE
  },
  {
    select: 'count(*) AS throughput',
    title: 'Application Throughput',
    formatValue: (value) => `${value.toFixed(1)} txn`,
    max: (max) => Math.ceil(max/100)*100,
    source: 'Transaction'
  },
  {
    select: 'count(*) AS errors',
    title: 'Application Errors',
    formatValue: (value) => `${value.toFixed(1)} errors`,
    max: (max) => Math.ceil(max/25)*25,
    source: 'TransactionError'
  },  

]

export default PLOTS