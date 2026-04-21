type Status = 'supported' | 'unsupported' | 'partial' | 'pending'

const icons: Record<Status, string> = {
  supported: '✅',
  unsupported: '❌',
  partial: '🟡',
  pending: '⏳',
}

interface Props {
  status: Status
  label: string
}

export default function TestResult({ status, label }: Props) {
  return (
    <div className={`test-result ${status}`}>
      <span>{icons[status]}</span>
      <span>{label}</span>
    </div>
  )
}
