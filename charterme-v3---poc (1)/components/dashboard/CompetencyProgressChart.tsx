
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { useTheme } from '../core/ThemeContext';

interface ChartInputData {
  name: string; // Competency Area Code e.g. "A"
  title: string;
  green: number; 
  amber: number;
  red: number;
  notAssessed: number;
  total: number; // Total sub-competencies in this area
}

interface CompetencyProgressChartProps {
  data: ChartInputData[];
}

interface TransformedChartData {
    name: string; // Competency Area Code
    greenPercent: number;
    amberPercent: number;
    redPercent: number;
    notAssessedPercent: number;
    // Original counts for tooltip
    greenCount: number;
    amberCount: number;
    redCount: number;
    notAssessedCount: number;
    totalCount: number;
}


const lightThemeChartColors = { // UNCHANGED
    greenFill: '#4CAF50',       
    amberFill: '#FF9800',       
    redFill: '#F44336',         
    notAssessedFill: '#BDBDBD',  
    axisText: '#777777',        
    gridStroke: '#E0E0E0',      
    tooltipBg: 'rgba(255, 255, 255, 0.95)', 
    tooltipBorder: '#D0D0D0',   
    legendText: '#333333',      
};

const darkThemeChartColors = { // REFRESHED
    greenFill: '#22C55E',        // dark-theme-accent-green
    amberFill: '#F59E0B',        // dark-theme-accent-amber
    redFill: '#EF4444',          // dark-theme-accent-red
    notAssessedFill: '#4B5563',  // dark-theme-bg-hover (neutral dark gray)
    axisText: '#9CA3AF',         // dark-theme-text-muted
    gridStroke: '#374151',       // dark-theme-border
    tooltipBg: 'rgba(31, 41, 55, 0.95)', // dark-theme-bg-surface with opacity
    tooltipBorder: '#4B5563',    // dark-theme-border-strong
    legendText: '#F3F4F6',       // dark-theme-text-base
};

const CustomTooltipContent: React.FC<any> = ({ active, payload, label, colors, theme }) => {
  if (active && payload && payload.length) {
    const data: TransformedChartData = payload[0].payload; 
    return (
      <div 
        className="p-3 rounded shadow-lg" 
        style={{ 
            backgroundColor: colors.tooltipBg, 
            border: `1px solid ${colors.tooltipBorder}`, 
            color: theme === 'light' ? lightThemeChartColors.legendText : darkThemeChartColors.legendText 
        }}
      >
        <p className="font-semibold text-sm mb-2">{`Area ${label}`}</p>
        <p style={{ color: colors.greenFill }} className="text-xs">{`Green: ${data.greenPercent.toFixed(1)}% (${data.greenCount})`}</p>
        <p style={{ color: colors.amberFill }} className="text-xs">{`Amber: ${data.amberPercent.toFixed(1)}% (${data.amberCount})`}</p>
        <p style={{ color: colors.redFill }} className="text-xs">{`Red: ${data.redPercent.toFixed(1)}% (${data.redCount})`}</p>
        <p style={{ color: colors.notAssessedFill }} className="text-xs">{`Not Assessed: ${data.notAssessedPercent.toFixed(1)}% (${data.notAssessedCount})`}</p>
        <p className="mt-2 pt-1 border-t text-xs" style={{borderColor: theme === 'light' ? lightThemeChartColors.gridStroke : darkThemeChartColors.gridStroke}}>
            {`Total: ${data.totalCount} Sub-Competencies`}
        </p>
      </div>
    );
  }
  return null;
};


const CompetencyProgressChart: React.FC<CompetencyProgressChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const chartColors = theme === 'light' ? lightThemeChartColors : darkThemeChartColors;

  const chartData: TransformedChartData[] = data.map(item => {
    const total = item.total || 1; // Avoid division by zero, though total should ideally be > 0
    return {
        name: item.name,
        greenPercent: (item.green / total) * 100,
        amberPercent: (item.amber / total) * 100,
        redPercent: (item.red / total) * 100,
        notAssessedPercent: (item.notAssessed / total) * 100,
        greenCount: item.green,
        amberCount: item.amber,
        redCount: item.red,
        notAssessedCount: item.notAssessed,
        totalCount: item.total,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 20 }} 
      >
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke}/>
        <XAxis dataKey="name" tick={{ fill: chartColors.axisText, fontSize: 12 }} />
        <YAxis 
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fill: chartColors.axisText, fontSize: 12 }}
            label={{ 
                value: 'Percentage of Sub-Competencies (%)', 
                angle: -90, 
                position: 'insideLeft', 
                fill: chartColors.axisText, 
                fontSize: 12,
                dy: 70, 
                dx: -5
            }} 
        />
        <Tooltip
          content={<CustomTooltipContent colors={chartColors} theme={theme} />}
          cursor={{fill: theme === 'light' ? 'rgba(224, 224, 224, 0.3)' : 'rgba(75, 85, 99, 0.3)' }} 
        />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{color: chartColors.legendText, fontSize: '12px'}}/>
        
        <Bar dataKey="greenPercent" stackId="a" name="Green" fill={chartColors.greenFill} barSize={35} />
        <Bar dataKey="amberPercent" stackId="a" name="Amber" fill={chartColors.amberFill} barSize={35} />
        <Bar dataKey="redPercent" stackId="a" name="Red" fill={chartColors.redFill} barSize={35} />
        <Bar dataKey="notAssessedPercent" stackId="a" name="Not Assessed" fill={chartColors.notAssessedFill} barSize={35} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CompetencyProgressChart;
