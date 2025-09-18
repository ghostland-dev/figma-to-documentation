interface FigmaNode {
  id: string
  name: string
  type: string
  fills?: any[]
  strokes?: any[]
  effects?: any[]
  children?: FigmaNode[]
  style?: any
  characters?: string
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  constraints?: any
  layoutMode?: string
  itemSpacing?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
}

interface DesignToken {
  name: string
  value: any
  type: string
  description?: string
  usage?: string[]
}

interface ComponentAnalysis {
  id: string
  name: string
  type: string
  description: string
  properties: Record<string, any>
  variants?: string[]
  usage: number
  category: string
}

interface DesignSystemAnalysis {
  colors: DesignToken[]
  typography: DesignToken[]
  spacing: DesignToken[]
  components: ComponentAnalysis[]
  effects: DesignToken[]
  layout: {
    grids: DesignToken[]
    breakpoints: DesignToken[]
  }
  summary: {
    totalComponents: number
    totalColors: number
    totalTextStyles: number
    designSystemScore: number
    recommendations: string[]
  }
}

export async function analyzeDesignSystem(
  fileData: any,
  stylesData: any,
  componentsData: any,
  analysisType = "full",
): Promise<DesignSystemAnalysis> {
  const analysis: DesignSystemAnalysis = {
    colors: [],
    typography: [],
    spacing: [],
    components: [],
    effects: [],
    layout: {
      grids: [],
      breakpoints: [],
    },
    summary: {
      totalComponents: 0,
      totalColors: 0,
      totalTextStyles: 0,
      designSystemScore: 0,
      recommendations: [],
    },
  }

  // Extract colors from styles and fills
  if (analysisType === "full" || analysisType === "colors") {
    analysis.colors = extractColors(fileData, stylesData)
  }

  // Extract typography from text styles
  if (analysisType === "full" || analysisType === "typography") {
    analysis.typography = extractTypography(fileData, stylesData)
  }

  // Extract components
  if (analysisType === "full" || analysisType === "components") {
    analysis.components = extractComponents(fileData, componentsData)
  }

  // Extract spacing and layout tokens
  if (analysisType === "full") {
    analysis.spacing = extractSpacing(fileData)
    analysis.effects = extractEffects(fileData)
    analysis.layout = extractLayout(fileData)
  }

  // Generate summary and recommendations
  analysis.summary = generateSummary(analysis)

  return analysis
}

function extractColors(fileData: any, stylesData: any): DesignToken[] {
  const colors: DesignToken[] = []
  const colorMap = new Map<string, { count: number; contexts: string[] }>()

  // Extract from published styles
  if (stylesData.meta?.styles) {
    Object.values(stylesData.meta.styles).forEach((style: any) => {
      if (style.style_type === "FILL") {
        const color = extractColorFromFill(style)
        if (color) {
          colors.push({
            name: style.name,
            value: color,
            type: "color",
            description: style.description || determineColorUsage(style.name),
            usage: [determineColorUsage(style.name)],
          })
        }
      }
    })
  }

  // Extract colors from actual usage in nodes
  function traverseForColors(nodes: FigmaNode[], context = "") {
    nodes.forEach((node) => {
      if (node.fills) {
        node.fills.forEach((fill) => {
          if (fill.type === "SOLID" && fill.color) {
            const hex = rgbToHex(fill.color)
            const existing = colorMap.get(hex)
            if (existing) {
              existing.count++
              existing.contexts.push(`${context}/${node.name}`)
            } else {
              colorMap.set(hex, {
                count: 1,
                contexts: [`${context}/${node.name}`],
              })
            }
          }
        })
      }

      if (node.children) {
        traverseForColors(node.children, `${context}/${node.name}`)
      }
    })
  }

  // Process all pages
  fileData.document.children.forEach((page: FigmaNode) => {
    if (page.children) {
      traverseForColors(page.children, page.name)
    }
  })

  // Add frequently used colors that aren't in styles
  Array.from(colorMap.entries())
    .filter(([hex, data]) => data.count >= 3) // Colors used 3+ times
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .forEach(([hex, data]) => {
      if (!colors.some((c) => c.value === hex)) {
        colors.push({
          name: `Color ${hex}`,
          value: hex,
          type: "color",
          description: `Used ${data.count} times`,
          usage: data.contexts.slice(0, 3),
        })
      }
    })

  return colors
}

function extractTypography(fileData: any, stylesData: any): DesignToken[] {
  const typography: DesignToken[] = []
  const textStyleMap = new Map<string, { count: number; contexts: string[] }>()

  // Extract from published text styles
  if (stylesData.meta?.styles) {
    Object.values(stylesData.meta.styles).forEach((style: any) => {
      if (style.style_type === "TEXT") {
        typography.push({
          name: style.name,
          value: {
            fontFamily: style.font_family || "Inter",
            fontSize: style.font_size || 16,
            fontWeight: style.font_weight || 400,
            lineHeight: style.line_height_percent ? `${style.line_height_percent}%` : "normal",
            letterSpacing: style.letter_spacing || 0,
          },
          type: "typography",
          description: style.description || determineTypographyUsage(style.name),
        })
      }
    })
  }

  // Extract typography from actual text nodes
  function traverseForTypography(nodes: FigmaNode[], context = "") {
    nodes.forEach((node) => {
      if (node.type === "TEXT" && node.style) {
        const styleKey = `${node.style.fontFamily}-${node.style.fontSize}-${node.style.fontWeight}`
        const existing = textStyleMap.get(styleKey)
        if (existing) {
          existing.count++
          existing.contexts.push(`${context}/${node.name}`)
        } else {
          textStyleMap.set(styleKey, {
            count: 1,
            contexts: [`${context}/${node.name}`],
          })
        }
      }

      if (node.children) {
        traverseForTypography(node.children, `${context}/${node.name}`)
      }
    })
  }

  // Process all pages
  fileData.document.children.forEach((page: FigmaNode) => {
    if (page.children) {
      traverseForTypography(page.children, page.name)
    }
  })

  return typography
}

function extractComponents(fileData: any, componentsData: any): ComponentAnalysis[] {
  const components: ComponentAnalysis[] = []

  // Extract from published components
  if (componentsData.meta?.components) {
    Object.values(componentsData.meta.components).forEach((component: any) => {
      components.push({
        id: component.node_id,
        name: component.name,
        type: component.containing_frame?.name || "Component",
        description: component.description || generateComponentDescription(component),
        properties: extractComponentProperties(component),
        variants: extractComponentVariants(component),
        usage: 0, // Would need additional API calls to get usage
        category: categorizeComponent(component.name),
      })
    })
  }

  // Extract component instances and usage
  function traverseForComponents(nodes: FigmaNode[]) {
    nodes.forEach((node) => {
      if (node.type === "INSTANCE") {
        const existingComponent = components.find((c) => c.id === node.id)
        if (existingComponent) {
          existingComponent.usage++
        }
      }

      if (node.children) {
        traverseForComponents(node.children)
      }
    })
  }

  // Process all pages for usage counting
  fileData.document.children.forEach((page: FigmaNode) => {
    if (page.children) {
      traverseForComponents(page.children)
    }
  })

  return components
}

function extractSpacing(fileData: any): DesignToken[] {
  const spacingValues = new Set<number>()

  function traverseForSpacing(nodes: FigmaNode[]) {
    nodes.forEach((node) => {
      // Extract padding values
      if (node.paddingLeft) spacingValues.add(node.paddingLeft)
      if (node.paddingRight) spacingValues.add(node.paddingRight)
      if (node.paddingTop) spacingValues.add(node.paddingTop)
      if (node.paddingBottom) spacingValues.add(node.paddingBottom)

      // Extract item spacing (gap)
      if (node.itemSpacing) spacingValues.add(node.itemSpacing)

      if (node.children) {
        traverseForSpacing(node.children)
      }
    })
  }

  fileData.document.children.forEach((page: FigmaNode) => {
    if (page.children) {
      traverseForSpacing(page.children)
    }
  })

  return Array.from(spacingValues)
    .filter((value) => value > 0 && value <= 200) // Reasonable spacing values
    .sort((a, b) => a - b)
    .map((value) => ({
      name: `spacing-${value}`,
      value: `${value}px`,
      type: "spacing",
      description: `${value}px spacing token`,
    }))
}

function extractEffects(fileData: any): DesignToken[] {
  const effects: DesignToken[] = []
  const effectMap = new Map<string, any>()

  function traverseForEffects(nodes: FigmaNode[]) {
    nodes.forEach((node) => {
      if (node.effects && node.effects.length > 0) {
        node.effects.forEach((effect) => {
          const effectKey = `${effect.type}-${JSON.stringify(effect)}`
          if (!effectMap.has(effectKey)) {
            effectMap.set(effectKey, effect)
            effects.push({
              name: `${effect.type.toLowerCase()}-${effects.length + 1}`,
              value: effect,
              type: "effect",
              description: `${effect.type} effect`,
            })
          }
        })
      }

      if (node.children) {
        traverseForEffects(node.children)
      }
    })
  }

  fileData.document.children.forEach((page: FigmaNode) => {
    if (page.children) {
      traverseForEffects(page.children)
    }
  })

  return effects
}

function extractLayout(fileData: any): { grids: DesignToken[]; breakpoints: DesignToken[] } {
  // This would extract layout grids and responsive breakpoints
  // Simplified implementation for now
  return {
    grids: [
      {
        name: "12-column-grid",
        value: { columns: 12, gutter: 20, margin: 20 },
        type: "grid",
        description: "Standard 12-column grid system",
      },
    ],
    breakpoints: [
      { name: "mobile", value: "768px", type: "breakpoint", description: "Mobile breakpoint" },
      { name: "tablet", value: "1024px", type: "breakpoint", description: "Tablet breakpoint" },
      { name: "desktop", value: "1440px", type: "breakpoint", description: "Desktop breakpoint" },
    ],
  }
}

function generateSummary(analysis: DesignSystemAnalysis) {
  const recommendations: string[] = []

  if (analysis.colors.length < 5) {
    recommendations.push("Consider defining more color tokens for better consistency")
  }

  if (analysis.typography.length < 3) {
    recommendations.push("Add more typography styles for better text hierarchy")
  }

  if (analysis.components.length < 10) {
    recommendations.push("Create more reusable components to improve design efficiency")
  }

  const designSystemScore = Math.min(
    100,
    (analysis.colors.length * 5 + analysis.typography.length * 10 + analysis.components.length * 3) / 2,
  )

  return {
    totalComponents: analysis.components.length,
    totalColors: analysis.colors.length,
    totalTextStyles: analysis.typography.length,
    designSystemScore,
    recommendations,
  }
}

// Helper functions
function extractColorFromFill(style: any): string | null {
  // Simplified - would need more robust color extraction
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  )
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

function determineColorUsage(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("primary")) return "Primary brand color"
  if (lowerName.includes("secondary")) return "Secondary accent color"
  if (lowerName.includes("background")) return "Background color"
  if (lowerName.includes("text")) return "Text color"
  if (lowerName.includes("border")) return "Border color"
  return "General use color"
}

function determineTypographyUsage(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("heading") || lowerName.includes("h1")) return "Heading text style"
  if (lowerName.includes("body")) return "Body text style"
  if (lowerName.includes("caption")) return "Caption text style"
  return "Text style"
}

function generateComponentDescription(component: any): string {
  return `${component.name} is a reusable component in the design system.`
}

function extractComponentProperties(component: any): Record<string, any> {
  return {
    width: component.absolute_bounding_box?.width || 0,
    height: component.absolute_bounding_box?.height || 0,
    // Add more properties as needed
  }
}

function extractComponentVariants(component: any): string[] {
  // Extract component variants if available
  return []
}

function categorizeComponent(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("button")) return "Interactive"
  if (lowerName.includes("input") || lowerName.includes("form")) return "Form"
  if (lowerName.includes("card")) return "Layout"
  if (lowerName.includes("icon")) return "Icon"
  return "General"
}
