import { ProvinceData, LegendItem } from './types'

/**
 * Enhanced color calculation based on data saturation
 */
export const getDataSaturationColor = (
  value: number,
  minValue: number,
  maxValue: number,
  colorScheme: 'green' | 'blue' | 'purple' | 'custom' = 'green'
): string => {
  if (!value || value === 0) return '#f3f4f6' // Gray for no data

  // Normalize the value between 0 and 1
  const normalized = (value - minValue) / (maxValue - minValue)

  // Create a gradient from light to dark based on saturation
  const intensity = Math.pow(normalized, 0.7) // Slight curve for better visual distribution

  const colorMaps = {
    green: {
      veryHigh: '#064e3b',    // Very high - very dark green
      high: '#065f46',        // High - dark green
      mediumHigh: '#16a34a',  // Medium-high - green
      medium: '#22c55e',      // Medium - light green
      lowMedium: '#4ade80',   // Low-medium - lighter green
      low: '#86efac'          // Very low - very light green
    },
    blue: {
      veryHigh: '#1e3a8a',
      high: '#1d4ed8',
      mediumHigh: '#3b82f6',
      medium: '#60a5fa',
      lowMedium: '#93c5fd',
      low: '#bfdbfe'
    },
    purple: {
      veryHigh: '#581c87',
      high: '#7c3aed',
      mediumHigh: '#8b5cf6',
      medium: '#a78bfa',
      lowMedium: '#c4b5fd',
      low: '#ddd6fe'
    },
    custom: {
      veryHigh: '#064e3b',
      high: '#065f46',
      mediumHigh: '#16a34a',
      medium: '#22c55e',
      lowMedium: '#4ade80',
      low: '#86efac'
    }
  }

  const colors = colorMaps[colorScheme]

  if (intensity >= 0.9) return colors.veryHigh
  if (intensity >= 0.7) return colors.high
  if (intensity >= 0.5) return colors.mediumHigh
  if (intensity >= 0.3) return colors.medium
  if (intensity >= 0.15) return colors.lowMedium
  return colors.low
}

/**
 * Generate legend items based on data range and color scheme
 */
export const generateLegendItems = (
  minValue: number,
  maxValue: number,
  colorScheme: 'green' | 'blue' | 'purple' | 'custom' = 'green'
): LegendItem[] => {
  const range = maxValue - minValue
  const step = range / 6

  return [
    {
      color: getDataSaturationColor(maxValue, minValue, maxValue, colorScheme),
      label: `Sangat Tinggi (>90th percentile)`,
      minValue: minValue + step * 5.4,
      maxValue: maxValue
    },
    {
      color: getDataSaturationColor(minValue + step * 4.2, minValue, maxValue, colorScheme),
      label: `Tinggi (70-90th percentile)`,
      minValue: minValue + step * 4.2,
      maxValue: minValue + step * 5.4
    },
    {
      color: getDataSaturationColor(minValue + step * 3, minValue, maxValue, colorScheme),
      label: `Sedang-Tinggi (50-70th percentile)`,
      minValue: minValue + step * 3,
      maxValue: minValue + step * 4.2
    },
    {
      color: getDataSaturationColor(minValue + step * 1.8, minValue, maxValue, colorScheme),
      label: `Sedang (30-50th percentile)`,
      minValue: minValue + step * 1.8,
      maxValue: minValue + step * 3
    },
    {
      color: getDataSaturationColor(minValue + step * 0.9, minValue, maxValue, colorScheme),
      label: `Rendah-Sedang (15-30th percentile)`,
      minValue: minValue + step * 0.9,
      maxValue: minValue + step * 1.8
    },
    {
      color: getDataSaturationColor(minValue + step * 0.1, minValue, maxValue, colorScheme),
      label: `Rendah (<15th percentile)`,
      minValue: minValue,
      maxValue: minValue + step * 0.9
    },
    {
      color: '#f3f4f6',
      label: 'Tidak ada data',
      minValue: 0,
      maxValue: 0
    }
  ]
}

/**
 * Helper function to extract province name from GeoJSON properties
 */
export const extractProvinceName = (properties: any): string | null => {
  if (!properties) return null

  // Try all possible property keys for province names
  const possibleKeys = [
    'PROVINSI', 'NAME_1', 'name', 'Provinsi', 'PROVNO', 'ADMIN',
    'ADM1_EN', 'ADM1_ID', 'NAMA', 'PROVINCE', 'prov', 'province_name',
    'NAME', 'NAMA_PROV', 'PROVINSI_', 'province', 'Province',
    'admin', 'adm1_en', 'adm1_id', 'nama_prov', 'NAME_EN', 'NAME_ID'
  ]

  for (const key of possibleKeys) {
    if (properties[key]) {
      return properties[key]
    }
  }

  // If still no province name, try any property that looks like a name
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string' && value.length > 2 && value.length < 50) {
      return value
    }
  }

  return null
}

/**
 * Helper function to match province names from GeoJSON to our data
 */
export const findProvinceIdByName = (provinceName: string): string | null => {
  if (!provinceName) return null

  const nameMapping: { [key: string]: string } = {
    // Indonesian names (common in GeoJSON)
    'DKI JAKARTA': 'DKI_JAKARTA',
    'JAKARTA': 'DKI_JAKARTA',
    'DKI_JAKARTA': 'DKI_JAKARTA',
    'JAKARTA RAYA': 'DKI_JAKARTA',
    'D.K.I. JAKARTA': 'DKI_JAKARTA',
    'SPECIAL CAPITAL REGION OF JAKARTA': 'DKI_JAKARTA',

    'JAWA BARAT': 'JAWA_BARAT',
    'WEST JAVA': 'JAWA_BARAT',
    'JAWA_BARAT': 'JAWA_BARAT',
    'JABAR': 'JAWA_BARAT',

    'JAWA TENGAH': 'JAWA_TENGAH',
    'CENTRAL JAVA': 'JAWA_TENGAH',
    'JAWA_TENGAH': 'JAWA_TENGAH',
    'JATENG': 'JAWA_TENGAH',

    'JAWA TIMUR': 'JAWA_TIMUR',
    'EAST JAVA': 'JAWA_TIMUR',
    'JAWA_TIMUR': 'JAWA_TIMUR',
    'JATIM': 'JAWA_TIMUR',

    'SUMATERA UTARA': 'SUMATERA_UTARA',
    'NORTH SUMATRA': 'SUMATERA_UTARA',
    'SUMATERA_UTARA': 'SUMATERA_UTARA',
    'SUMATRA UTARA': 'SUMATERA_UTARA',
    'SUMUT': 'SUMATERA_UTARA',
    'SUMATERA UTARA PROVINCE': 'SUMATERA_UTARA',

    'SUMATERA BARAT': 'SUMATERA_BARAT',
    'WEST SUMATRA': 'SUMATERA_BARAT',
    'SUMATERA_BARAT': 'SUMATERA_BARAT',
    'SUMATRA BARAT': 'SUMATERA_BARAT',
    'SUMBAR': 'SUMATERA_BARAT',

    'SUMATERA SELATAN': 'SUMATERA_SELATAN',
    'SOUTH SUMATRA': 'SUMATERA_SELATAN',
    'SUMATERA_SELATAN': 'SUMATERA_SELATAN',
    'SUMATRA SELATAN': 'SUMATERA_SELATAN',
    'SUMSEL': 'SUMATERA_SELATAN',

    'RIAU': 'RIAU',
    'RIAU PROVINCE': 'RIAU',

    'KALIMANTAN TIMUR': 'KALIMANTAN_TIMUR',
    'EAST KALIMANTAN': 'KALIMANTAN_TIMUR',
    'KALIMANTAN_TIMUR': 'KALIMANTAN_TIMUR',
    'KALTIM': 'KALIMANTAN_TIMUR',

    'KALIMANTAN SELATAN': 'KALIMANTAN_SELATAN',
    'SOUTH KALIMANTAN': 'KALIMANTAN_SELATAN',
    'KALIMANTAN_SELATAN': 'KALIMANTAN_SELATAN',
    'KALSEL': 'KALIMANTAN_SELATAN',

    'SULAWESI SELATAN': 'SULAWESI_SELATAN',
    'SOUTH SULAWESI': 'SULAWESI_SELATAN',
    'SULAWESI_SELATAN': 'SULAWESI_SELATAN',
    'SULSEL': 'SULAWESI_SELATAN',

    'BALI': 'BALI',
    'BALI PROVINCE': 'BALI',

    'PAPUA': 'PAPUA',
    'IRIAN JAYA': 'PAPUA',
    'PAPUA PROVINCE': 'PAPUA',

    'NUSA TENGGARA BARAT': 'NUSA_TENGGARA_BARAT',
    'WEST NUSA TENGGARA': 'NUSA_TENGGARA_BARAT',
    'NUSA_TENGGARA_BARAT': 'NUSA_TENGGARA_BARAT',
    'NTB': 'NUSA_TENGGARA_BARAT',

    'LAMPUNG': 'LAMPUNG',
    'LAMPUNG PROVINCE': 'LAMPUNG',

    // Add more province mappings
    'YOGYAKARTA': 'DI_YOGYAKARTA',
    'DI YOGYAKARTA': 'DI_YOGYAKARTA',
    'SPECIAL REGION OF YOGYAKARTA': 'DI_YOGYAKARTA',
    'DAERAH ISTIMEWA YOGYAKARTA': 'DI_YOGYAKARTA',

    'BANTEN': 'BANTEN',
    'BANTEN PROVINCE': 'BANTEN',

    'ACEH': 'ACEH',
    'NANGGROE ACEH DARUSSALAM': 'ACEH',
    'ACEH PROVINCE': 'ACEH'
  }

  // Try exact match first
  const upperName = provinceName.toUpperCase().trim()

  if (nameMapping[upperName]) {
    return nameMapping[upperName]
  }

  // Try partial match
  for (const [key, value] of Object.entries(nameMapping)) {
    if (upperName.includes(key) || key.includes(upperName)) {
      return value
    }
  }

  // Try to match by removing common suffixes/prefixes
  const cleanName = upperName
    .replace(/\bPROVINCE\b/g, '')
    .replace(/\bPROVINSI\b/g, '')
    .replace(/\bDAERAH\b/g, '')
    .replace(/\bISTIMEWA\b/g, '')
    .replace(/\bKHUSUS\b/g, '')
    .trim()

  if (cleanName !== upperName && nameMapping[cleanName]) {
    return nameMapping[cleanName]
  }

  return null
}

/**
 * Consistent number formatting function
 */
export const formatNumber = (num: number, isClient: boolean = true): string => {
  if (!isClient) return num.toString() // Return plain number during SSR
  return num.toLocaleString('id-ID') // Use Indonesian locale on client
}
