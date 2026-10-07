import { Link } from 'react-router'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { TRAIT_KEYS, TRAITS, type TraitKey, type TraitScores } from '@/lib/traits'

// 차트 색은 index.css의 --chart-1~3(직무 등 범주), --chart-me(나)를 쓴다.
// 범주색 순서는 dataviz 검증기로 색약 구분을 통과한 순서이므로 바꾸지 않는다.
export const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'] as const
export const ME_COLOR = 'var(--chart-me)'

const LABEL_TO_KEY = Object.fromEntries(TRAIT_KEYS.map((k) => [TRAITS[k].label, k])) as Record<string, TraitKey>

export interface RadarSeries {
  key: string
  label: string
  color: string
  values: TraitScores
  /** "나"처럼 기준선으로 보여줄 계열: 점선 + 채움 없음 */
  dashed?: boolean
}

/**
 * 6개 성향 레이더 차트.
 * 계열이 하나면 축 라벨 아래에 점수를 직접 표시하고, 둘 이상이면 범례를 붙인다.
 * 스크린리더용으로 같은 값을 표로도 제공한다.
 */
export function TraitRadar({ series, className }: { series: RadarSeries[]; className?: string }) {
  const single = series.length === 1
  const data = TRAIT_KEYS.map((k) => ({
    trait: TRAITS[k].label,
    ...Object.fromEntries(series.map((s) => [s.key, s.values[k]])),
  }))
  const config = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig

  return (
    <figure className={cn('space-y-3', className)}>
      {!single && <Legend items={series} />}
      {/* 축 라벨이 차트 밖으로 나가도 잘리지 않도록 SVG overflow를 연다. */}
      <ChartContainer
        config={config}
        className="mx-auto aspect-square w-full max-w-[22rem] [&_.recharts-surface]:overflow-visible"
        aria-hidden
      >
        <RadarChart data={data} outerRadius="62%" margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator={single ? 'dot' : 'line'} />} />
          <PolarGrid stroke="var(--border)" strokeWidth={1} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
          <PolarAngleAxis
            dataKey="trait"
            tick={(props) => <AngleTick {...props} value={single ? series[0].values[LABEL_TO_KEY[props.payload.value]] : undefined} />}
          />
          {series.map((s) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              fill={`var(--color-${s.key})`}
              fillOpacity={s.dashed ? 0 : single ? 0.25 : 0.1}
              dot={{ r: 4, fill: `var(--color-${s.key})`, stroke: 'var(--card)', strokeWidth: 2, fillOpacity: 1 }}
              activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </RadarChart>
      </ChartContainer>
      {/* <table>은 sr-only의 1px 폭을 무시하고 넘치므로 감싸는 div에 적용한다. */}
      <div className="sr-only">
        <table>
          <caption>성향별 점수 (100점 만점)</caption>
          <thead>
            <tr>
              <th scope="col">성향</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRAIT_KEYS.map((k) => (
              <tr key={k}>
                <th scope="row">{TRAITS[k].label}</th>
                {series.map((s) => (
                  <td key={s.key}>{s.values[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

interface AngleTickProps {
  x?: number | string
  y?: number | string
  cx?: number
  cy?: number
  payload: { value: string }
  textAnchor?: string
  value?: number | string
}

/** 축 라벨: 성향 이름 + (단일 계열일 때) 점수 */
function AngleTick({ x = 0, y = 0, cx = 0, cy = 0, payload, value }: AngleTickProps) {
  const nx = Number(x)
  const ny = Number(y)
  // 차트 중심에서 바깥쪽으로 살짝 밀어 라벨이 꼭짓점과 겹치지 않게 한다.
  const dx = nx - cx
  const dy = ny - cy
  const len = Math.hypot(dx, dy) || 1
  const px = nx + (dx / len) * 10
  const py = ny + (dy / len) * 10
  const anchor = Math.abs(dx) < 4 ? 'middle' : dx > 0 ? 'start' : 'end'
  const lines = value !== undefined ? 2 : 1
  const baseY = py - ((lines - 1) * 16) / 2 + (dy > 4 ? 8 : dy < -4 ? -4 : 4)

  return (
    <text x={px} y={baseY} textAnchor={anchor} className="fill-foreground text-[12px]">
      <tspan x={px} className="font-medium">
        {payload.value}
      </tspan>
      {value !== undefined && (
        <tspan x={px} dy={16} className="fill-primary text-[13px] font-bold">
          {value}
        </tspan>
      )}
    </text>
  )
}

function Legend({ items }: { items: { key: string; label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-sm" aria-label="범례">
      {items.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <svg width="18" height="10" aria-hidden>
            <line
              x1="1"
              y1="5"
              x2="17"
              y2="5"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? '4 3' : undefined}
            />
          </svg>
          <span className="text-muted-foreground">{s.label}</span>
        </li>
      ))}
    </ul>
  )
}

export interface FitBarItem {
  key: string
  label: string
  sublabel?: string
  value: number
  href?: string
  color?: string
}

/**
 * 적합도 가로 막대 (0~100%, 0 기준).
 * color가 없으면 첫 항목만 브랜드색으로 강조하고 나머지는 회색으로 둔다(강조형).
 * 막대마다 값을 직접 적어 색이나 길이만으로 정보를 전달하지 않는다.
 */
export function FitBars({ items }: { items: FitBarItem[] }) {
  return (
    <ol className="space-y-3.5">
      {items.map((item, i) => {
        const color = item.color ?? (i === 0 ? 'var(--primary)' : 'color-mix(in oklch, var(--chart-me) 40%, transparent)')
        const row = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                <span className={cn('font-bold', i === 0 && !item.color && 'text-primary')}>{item.label}</span>
                {item.sublabel && <span className="ml-2 text-xs text-muted-foreground">{item.sublabel}</span>}
              </span>
              <span className="shrink-0 font-bold tabular-nums">{item.value}%</span>
            </div>
            <span className="mt-1.5 block h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span
                className="block h-full rounded-r-[4px] rounded-l-full transition-[width] duration-500"
                style={{ width: `${item.value}%`, background: color }}
              />
            </span>
          </>
        )
        return (
          <li key={item.key}>
            {item.href ? (
              <Link to={item.href} className="group block rounded-xl p-1 -m-1 hover:bg-muted/50">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        )
      })}
    </ol>
  )
}
