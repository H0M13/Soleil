import React from 'react';
import { BarStackHorizontal } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { format, parseISO } from "date-fns"
import { withTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { LegendOrdinal } from '@visx/legend';
import { useTheme } from "@mui/material"

type BreakdownName = 'By you' | 'By others';

type ContributionBreakdown = {
  "By you": string;
  "By others": string;
  date: string;
}

type TooltipData = {
  bar: SeriesPoint<ContributionBreakdown>;
  key: BreakdownName;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
};

export type BarStackHorizontalProps = {
  data: any;
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
};

let tooltipTimeout: number;

export default withTooltip<BarStackHorizontalProps, TooltipData>(
  ({
    data,
    width,
    height,
    events = false,
    margin = { top: 40, left: 50, right: 40, bottom: 40 },
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  }: BarStackHorizontalProps & WithTooltipProvidedProps<TooltipData>) => {

    const keys = Object.keys(data[0]).filter((d) => d !== 'date') as BreakdownName[];

    const theme = useTheme()

    const purple1 = theme.palette.primary.main;
    const purple2 = theme.palette.secondary.main;
    const purple3 = theme.palette.text.primary;
    const background = 'transparent';
    const tooltipStyles = {
      ...defaultStyles,
      minWidth: 60,
      backgroundColor: 'rgba(0,0,0,0.9)',
      color: 'white',
    };
    
    const percentageTotals = data.reduce((allTotals: any, currentDate: any) => {
      const totalPercentage = keys.reduce((dailyTotal, k) => {
        dailyTotal += Number(currentDate[k]);
        return dailyTotal;
      }, 0);
      allTotals.push(totalPercentage);
      return allTotals;
    }, [] as number[]);
    
    const formatDate = (date: string) => format(parseISO(date), "dd MMM");
    
    // accessors
    const getDate = (d: ContributionBreakdown) => d.date;
    
    // scales
    const percentageScale = scaleLinear<number>({
      domain: [0, Math.max(...percentageTotals)],
      nice: true,
    });
    const dateScale = scaleBand<string>({
      domain: data.map(getDate),
      padding: 0.2,
    });
    const colorScale = scaleOrdinal<BreakdownName, string>({
      domain: keys,
      range: [purple1, purple2, purple3],
    });

    // bounds
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    percentageScale.rangeRound([0, xMax]);
    dateScale.rangeRound([0, yMax]);

    return width < 10 ? null : (
      <div>
        <svg width={width} height={height}>
          <rect width={width} height={height} fill={background} rx={14} />
          <Group top={margin.top} left={margin.left}>
            <BarStackHorizontal<ContributionBreakdown, BreakdownName>
              data={data}
              keys={keys}
              height={yMax}
              y={getDate}
              xScale={percentageScale}
              yScale={dateScale}
              color={colorScale}
            >
              {(barStacks: any) =>
                barStacks.map((barStack: any) =>
                  barStack.bars.map((bar: any) => (
                    <rect
                      key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      onClick={() => {
                        if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                      }}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={() => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const top = bar.y + margin.top;
                        const left = bar.x + bar.width + margin.left;
                        showTooltip({
                          tooltipData: bar,
                          tooltipTop: top,
                          tooltipLeft: left,
                        });
                      }}
                    />
                  )),
                )
              }
            </BarStackHorizontal>
            <AxisLeft
              hideAxisLine
              hideTicks
              scale={dateScale}
              tickFormat={formatDate}
              stroke={purple3}
              tickStroke={purple3}
              tickLabelProps={() => ({
                fill: purple3,
                fontSize: 11,
                fontFamily: "'Source Code Pro', monospace",
                textAnchor: 'end',
                dy: '0.33em',
              })}
            />
            <AxisBottom
              top={yMax}
              scale={percentageScale}
              stroke={purple3}
              tickStroke={purple3}
              tickLabelProps={() => ({
                fill: purple3,
                fontSize: 11,
                fontFamily: "'Source Code Pro', monospace",
                textAnchor: 'middle',
              })}
            />
          </Group>
        </svg>
        <div
          style={{
            position: 'absolute',
            top: margin.top / 2 - 10,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontSize: '14px',
            fontFamily: "'Source Code Pro', monospace",
          }}
        >
          <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" />
        </div>
        {tooltipOpen && tooltipData && (
          <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
            <div style={{ color: colorScale(tooltipData.key) }}>
              <strong>{tooltipData.key}</strong>
            </div>
            <div>{parseFloat(tooltipData.bar.data[tooltipData.key]).toFixed(2)} DAI</div>
            <div>
              <small>{formatDate(getDate(tooltipData.bar.data))}</small>
            </div>
          </Tooltip>
        )}
      </div>
    );
  },
);