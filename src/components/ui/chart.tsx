"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
            "st-flex st-aspect-video st-justify-center st-text-xs [&_.recharts-cartesian-axis-tick_text]:st-fill-muted-foreground [&_.recharts-cartesian-st-grid_line[stroke='#ccc']]:st-stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:st-stroke-border [&_.recharts-dot[stroke='#fff']]:st-stroke-transparent [&_.recharts-layer]:st-outline-none [&_.recharts-polar-st-grid_[stroke='#ccc']]:st-stroke-border [&_.recharts-radial-bar-background-sector]:st-fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:st-fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:st-stroke-border [&_.recharts-sector[stroke='#fff']]:st-stroke-transparent [&_.recharts-sector]:st-outline-none [&_.recharts-surface]:st-outline-none",
            className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("st-font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("st-font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

      return (
          <div
              ref={ref}
              className={cn(
                  "st-grid st-min-w-[8rem] st-items-start st-gap-1.5 st-rounded-lg st-border st-border-border/50 st-bg-background st-px-2.5 st-py-1.5 st-text-xs st-shadow-xl",
                  className
              )}
          >
              {!nestLabel ? tooltipLabel : null}
              <div className="st-grid st-gap-1.5">
                  {payload.map((item, index) => {
                      const key = `${nameKey || item.name || item.dataKey || "value"}`
                      const itemConfig = getPayloadConfigFromPayload(config, item, key)
                      const indicatorColor = color || item.payload.fill || item.color

                      return (
                          <div
                              key={item.dataKey}
                              className={cn(
                                  "st-flex st-w-full st-flex-wrap st-items-stretch st-gap-2 [&>svg]:st-h-2.5 [&>svg]:st-w-2.5 [&>svg]:st-text-muted-foreground",
                                  indicator === "dot" && "st-items-center"
                              )}
                          >
                              {formatter && item?.value !== undefined && item.name ? (
                                  formatter(item.value, item.name, item, index, item.payload)
                              ) : (
                                  <>
                                      {itemConfig?.icon ? (
                                          <itemConfig.icon />
                                      ) : (
                                          !hideIndicator && (
                                              <div
                                                  className={cn(
                                                      "st-shrink-0 st-rounded-[2px] st-border-[--color-border] st-bg-[--color-bg]",
                                                      {
                                                          "st-h-2.5 st-w-2.5": indicator === "dot",
                                                          "st-w-1": indicator === "line",
                                                          "st-w-0 st-border-[1.5px] st-border-dashed st-bg-transparent":
                                                              indicator === "dashed",
                                                          "st-my-0.5": nestLabel && indicator === "dashed",
                                                      }
                                                  )}
                                                  style={
                                                      {
                                                          "--color-bg": indicatorColor,
                                                          "--color-border": indicatorColor,
                                                      } as React.CSSProperties
                                                  }
                                              />
                                          )
                                      )}
                                      <div
                                          className={cn(
                                              "st-flex st-flex-1 st-justify-between st-leading-none",
                                              nestLabel ? "st-items-end" : "st-items-center"
                                          )}
                                      >
                                          <div className="st-grid st-gap-1.5">
                                              {nestLabel ? tooltipLabel : null}
                                              <span className="st-text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                                          </div>
                                          {item.value && (
                                              <span className="st-font-mono st-font-medium tabular-nums st-text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                                          )}
                                      </div>
                                  </>
                              )}
                          </div>
                      )
                  })}
              </div>
          </div>
      )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

      return (
          <div
              ref={ref}
              className={cn(
                  "st-flex st-items-center st-justify-center st-gap-4",
                  verticalAlign === "top" ? "st-pb-3" : "st-pt-3",
                  className
              )}
          >
              {payload.map((item) => {
                  const key = `${nameKey || item.dataKey || "value"}`
                  const itemConfig = getPayloadConfigFromPayload(config, item, key)

                  return (
                      <div
                          key={item.value}
                          className={cn(
                              "st-flex st-items-center st-gap-1.5 [&>svg]:st-h-3 [&>svg]:st-w-3 [&>svg]:st-text-muted-foreground"
                          )}
                      >
                          {itemConfig?.icon && !hideIcon ? (
                              <itemConfig.icon />
                          ) : (
                              <div
                                  className="st-h-2 st-w-2 st-shrink-0 st-rounded-[2px]"
                                  style={{
                                      backgroundColor: item.color,
                                  }}
                              />
                          )}
                          {itemConfig?.label}
                      </div>
                  )
              })}
          </div>
      )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
