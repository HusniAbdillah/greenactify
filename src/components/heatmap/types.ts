export interface ProvinceData {
  id: string
  name: string
  code: string
  totalPoints: number
  totalActivities: number
  participants: number
  averagePerUser: number
  topActivity: string
  coordinates: [number, number]
  growth: string
  position: { x: number; y: number }
  rank?: number
}

export interface HeatmapConfig {
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  showLegend?: boolean
  showSummary?: boolean
  enableFullscreen?: boolean
  enableClick?: boolean
  height?: string
  colorScheme?: 'green' | 'blue' | 'purple' | 'custom'
  dataField?: keyof ProvinceData
}

export interface MapControlsConfig {
  showZoom?: boolean
  showAttribution?: boolean
  showScale?: boolean
}

export interface LegendItem {
  color: string
  label: string
  minValue?: number
  maxValue?: number
}
