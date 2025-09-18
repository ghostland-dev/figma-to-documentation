import { jsPDF } from "jspdf"

interface ExportOptions {
  includeImages?: boolean
  includeColors?: boolean
  includeTypography?: boolean
  includeComponents?: boolean
  template?: "minimal" | "detailed" | "presentation"
  theme?: "light" | "dark"
  customCSS?: string
}

interface ProjectInfo {
  id: string
  name: string
  figmaUrl: string
  createdAt: string
  analyzedAt: string
}

interface ExportRequest {
  designSystem: any
  projectInfo: ProjectInfo
  exportType: "pdf" | "html" | "markdown" | "presentation"
  options: ExportOptions
}

interface ExportResult {
  content: string | Buffer
  contentType: string
  filename: string
}

export async function generateExport(request: ExportRequest): Promise<ExportResult> {
  const { designSystem, projectInfo, exportType, options } = request

  switch (exportType) {
    case "pdf":
      return generatePDFExport(designSystem, projectInfo, options)
    case "html":
      return generateHTMLExport(designSystem, projectInfo, options)
    case "markdown":
      return generateMarkdownExport(designSystem, projectInfo, options)
    case "presentation":
      return generatePresentationExport(designSystem, projectInfo, options)
    default:
      throw new Error(`Unsupported export type: ${exportType}`)
  }
}

async function generatePDFExport(
  designSystem: any,
  projectInfo: ProjectInfo,
  options: ExportOptions,
): Promise<ExportResult> {
  const doc = new jsPDF()
  let yPosition = 20

  // Title page
  doc.setFontSize(24)
  doc.text(projectInfo.name, 20, yPosition)
  yPosition += 15

  doc.setFontSize(12)
  doc.text("Design System Documentation", 20, yPosition)
  yPosition += 10

  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
  yPosition += 20

  // Colors section
  if (options.includeColors !== false && designSystem.colors?.length > 0) {
    doc.setFontSize(18)
    doc.text("Colors", 20, yPosition)
    yPosition += 15

    designSystem.colors.forEach((color: any, index: number) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.text(`${color.name}: ${color.value}`, 20, yPosition)

      // Add color rectangle
      const hexColor = color.value.replace("#", "")
      const r = Number.parseInt(hexColor.substr(0, 2), 16)
      const g = Number.parseInt(hexColor.substr(2, 2), 16)
      const b = Number.parseInt(hexColor.substr(4, 2), 16)

      doc.setFillColor(r, g, b)
      doc.rect(150, yPosition - 5, 20, 8, "F")

      yPosition += 12
    })
    yPosition += 10
  }

  // Typography section
  if (options.includeTypography !== false && designSystem.typography?.length > 0) {
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(18)
    doc.text("Typography", 20, yPosition)
    yPosition += 15

    designSystem.typography.forEach((typo: any) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.text(`${typo.name}`, 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.text(
        `Font: ${typo.value.fontFamily} | Size: ${typo.value.fontSize}px | Weight: ${typo.value.fontWeight}`,
        20,
        yPosition,
      )
      yPosition += 15
    })
  }

  // Components section
  if (options.includeComponents !== false && designSystem.components?.length > 0) {
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(18)
    doc.text("Components", 20, yPosition)
    yPosition += 15

    designSystem.components.forEach((component: any) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.text(`${component.name} (${component.category})`, 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.text(component.description, 20, yPosition)
      yPosition += 15
    })
  }

  const pdfBuffer = doc.output("arraybuffer")

  return {
    content: Buffer.from(pdfBuffer),
    contentType: "application/pdf",
    filename: `${projectInfo.name.replace(/[^a-zA-Z0-9]/g, "-")}-design-system.pdf`,
  }
}

async function generateHTMLExport(
  designSystem: any,
  projectInfo: ProjectInfo,
  options: ExportOptions,
): Promise<ExportResult> {
  const template = options.template || "detailed"
  const theme = options.theme || "light"

  const colorsSection =
    options.includeColors !== false && designSystem.colors?.length > 0
      ? generateColorsHTML(designSystem.colors, template)
      : ""

  const typographySection =
    options.includeTypography !== false && designSystem.typography?.length > 0
      ? generateTypographyHTML(designSystem.typography, template)
      : ""

  const componentsSection =
    options.includeComponents !== false && designSystem.components?.length > 0
      ? generateComponentsHTML(designSystem.components, template)
      : ""

  const spacingSection = designSystem.spacing?.length > 0 ? generateSpacingHTML(designSystem.spacing, template) : ""

  const effectsSection = designSystem.effects?.length > 0 ? generateEffectsHTML(designSystem.effects, template) : ""

  const summarySection = designSystem.summary ? generateSummaryHTML(designSystem.summary, template) : ""

  const customCSS = options.customCSS || ""

  const html = `
<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectInfo.name} - Design System Documentation</title>
  <style>
    ${getBaseCSS(theme, template)}
    ${customCSS}
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${projectInfo.name}</h1>
      <p class="subtitle">Design System Documentation</p>
      <div class="meta">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>Analyzed on ${new Date(projectInfo.analyzedAt).toLocaleDateString()}</p>
        <a href="${projectInfo.figmaUrl}" target="_blank" rel="noopener">View in Figma</a>
      </div>
    </header>

    <nav class="navigation">
      <ul>
        ${summarySection ? '<li><a href="#summary">Summary</a></li>' : ""}
        ${colorsSection ? '<li><a href="#colors">Colors</a></li>' : ""}
        ${typographySection ? '<li><a href="#typography">Typography</a></li>' : ""}
        ${spacingSection ? '<li><a href="#spacing">Spacing</a></li>' : ""}
        ${effectsSection ? '<li><a href="#effects">Effects</a></li>' : ""}
        ${componentsSection ? '<li><a href="#components">Components</a></li>' : ""}
      </ul>
    </nav>

    <main class="content">
      ${summarySection}
      ${colorsSection}
      ${typographySection}
      ${spacingSection}
      ${effectsSection}
      ${componentsSection}
    </main>

    <footer class="footer">
      <p>Generated by FigmaDoc • <a href="https://figmadoc.com">Learn more</a></p>
    </footer>
  </div>

  <script>
    // Add smooth scrolling for navigation
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });

    // Add copy-to-clipboard for color values
    document.querySelectorAll('.color-value').forEach(element => {
      element.addEventListener('click', function() {
        navigator.clipboard.writeText(this.textContent);
        this.classList.add('copied');
        setTimeout(() => this.classList.remove('copied'), 1000);
      });
    });
  </script>
</body>
</html>`

  return {
    content: html,
    contentType: "text/html",
    filename: `${projectInfo.name.replace(/[^a-zA-Z0-9]/g, "-")}-design-system.html`,
  }
}

async function generateMarkdownExport(
  designSystem: any,
  projectInfo: ProjectInfo,
  options: ExportOptions,
): Promise<ExportResult> {
  let markdown = `# ${projectInfo.name}\n\n`
  markdown += `*Design System Documentation*\n\n`
  markdown += `**Generated:** ${new Date().toLocaleDateString()}\n`
  markdown += `**Analyzed:** ${new Date(projectInfo.analyzedAt).toLocaleDateString()}\n`
  markdown += `**Figma File:** [View in Figma](${projectInfo.figmaUrl})\n\n`

  // Table of Contents
  markdown += `## Table of Contents\n\n`
  if (designSystem.summary) markdown += `- [Summary](#summary)\n`
  if (options.includeColors !== false && designSystem.colors?.length > 0) markdown += `- [Colors](#colors)\n`
  if (options.includeTypography !== false && designSystem.typography?.length > 0)
    markdown += `- [Typography](#typography)\n`
  if (designSystem.spacing?.length > 0) markdown += `- [Spacing](#spacing)\n`
  if (designSystem.effects?.length > 0) markdown += `- [Effects](#effects)\n`
  if (options.includeComponents !== false && designSystem.components?.length > 0)
    markdown += `- [Components](#components)\n`
  markdown += `\n---\n\n`

  // Summary
  if (designSystem.summary) {
    markdown += `## Summary\n\n`
    markdown += `- **Total Components:** ${designSystem.summary.totalComponents}\n`
    markdown += `- **Total Colors:** ${designSystem.summary.totalColors}\n`
    markdown += `- **Total Text Styles:** ${designSystem.summary.totalTextStyles}\n`
    markdown += `- **Design System Score:** ${designSystem.summary.designSystemScore}/100\n\n`

    if (designSystem.summary.recommendations?.length > 0) {
      markdown += `### Recommendations\n\n`
      designSystem.summary.recommendations.forEach((rec: string) => {
        markdown += `- ${rec}\n`
      })
      markdown += `\n`
    }
  }

  // Colors
  if (options.includeColors !== false && designSystem.colors?.length > 0) {
    markdown += `## Colors\n\n`
    designSystem.colors.forEach((color: any) => {
      markdown += `### ${color.name}\n\n`
      markdown += `- **Value:** \`${color.value}\`\n`
      markdown += `- **Usage:** ${color.description || "General use"}\n`
      if (color.usage?.length > 0) {
        markdown += `- **Found in:** ${color.usage.join(", ")}\n`
      }
      markdown += `\n`
    })
  }

  // Typography
  if (options.includeTypography !== false && designSystem.typography?.length > 0) {
    markdown += `## Typography\n\n`
    designSystem.typography.forEach((typo: any) => {
      markdown += `### ${typo.name}\n\n`
      markdown += `- **Font Family:** ${typo.value.fontFamily}\n`
      markdown += `- **Font Size:** ${typo.value.fontSize}px\n`
      markdown += `- **Font Weight:** ${typo.value.fontWeight}\n`
      if (typo.value.lineHeight) markdown += `- **Line Height:** ${typo.value.lineHeight}\n`
      if (typo.value.letterSpacing) markdown += `- **Letter Spacing:** ${typo.value.letterSpacing}px\n`
      markdown += `\n`
    })
  }

  // Components
  if (options.includeComponents !== false && designSystem.components?.length > 0) {
    markdown += `## Components\n\n`

    // Group by category
    const componentsByCategory = designSystem.components.reduce((acc: any, component: any) => {
      const category = component.category || "General"
      if (!acc[category]) acc[category] = []
      acc[category].push(component)
      return acc
    }, {})

    Object.entries(componentsByCategory).forEach(([category, components]: [string, any]) => {
      markdown += `### ${category}\n\n`
      components.forEach((component: any) => {
        markdown += `#### ${component.name}\n\n`
        markdown += `${component.description}\n\n`
        if (component.variants?.length > 0) {
          markdown += `**Variants:** ${component.variants.join(", ")}\n\n`
        }
        if (component.usage > 0) {
          markdown += `**Usage Count:** ${component.usage}\n\n`
        }
      })
    })
  }

  markdown += `---\n\n*Generated by FigmaDoc*`

  return {
    content: markdown,
    contentType: "text/markdown",
    filename: `${projectInfo.name.replace(/[^a-zA-Z0-9]/g, "-")}-design-system.md`,
  }
}

async function generatePresentationExport(
  designSystem: any,
  projectInfo: ProjectInfo,
  options: ExportOptions,
): Promise<ExportResult> {
  const slides = []

  // Title slide
  slides.push(`
    <section class="slide title-slide">
      <h1>${projectInfo.name}</h1>
      <h2>Design System Documentation</h2>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </section>
  `)

  // Summary slide
  if (designSystem.summary) {
    slides.push(`
      <section class="slide">
        <h2>Overview</h2>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-number">${designSystem.summary.totalComponents}</div>
            <div class="stat-label">Components</div>
          </div>
          <div class="stat">
            <div class="stat-number">${designSystem.summary.totalColors}</div>
            <div class="stat-label">Colors</div>
          </div>
          <div class="stat">
            <div class="stat-number">${designSystem.summary.totalTextStyles}</div>
            <div class="stat-label">Text Styles</div>
          </div>
          <div class="stat">
            <div class="stat-number">${designSystem.summary.designSystemScore}</div>
            <div class="stat-label">DS Score</div>
          </div>
        </div>
      </section>
    `)
  }

  // Colors slide
  if (options.includeColors !== false && designSystem.colors?.length > 0) {
    const colorGrid = designSystem.colors
      .slice(0, 12)
      .map(
        (color: any) => `
      <div class="color-card">
        <div class="color-swatch" style="background-color: ${color.value}"></div>
        <div class="color-name">${color.name}</div>
        <div class="color-value">${color.value}</div>
      </div>
    `,
      )
      .join("")

    slides.push(`
      <section class="slide">
        <h2>Color Palette</h2>
        <div class="color-grid">
          ${colorGrid}
        </div>
      </section>
    `)
  }

  // Typography slide
  if (options.includeTypography !== false && designSystem.typography?.length > 0) {
    const typeExamples = designSystem.typography
      .slice(0, 6)
      .map(
        (typo: any) => `
      <div class="type-example">
        <div class="type-sample" style="font-family: ${typo.value.fontFamily}; font-size: ${Math.min(typo.value.fontSize, 32)}px; font-weight: ${typo.value.fontWeight};">
          The quick brown fox
        </div>
        <div class="type-details">
          <strong>${typo.name}</strong><br>
          ${typo.value.fontFamily} • ${typo.value.fontSize}px • ${typo.value.fontWeight}
        </div>
      </div>
    `,
      )
      .join("")

    slides.push(`
      <section class="slide">
        <h2>Typography</h2>
        <div class="typography-grid">
          ${typeExamples}
        </div>
      </section>
    `)
  }

  const presentationHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectInfo.name} - Design System Presentation</title>
  <style>
    ${getPresentationCSS()}
  </style>
</head>
<body>
  <div class="presentation">
    ${slides.join("")}
  </div>
  
  <div class="controls">
    <button id="prevBtn">Previous</button>
    <span id="slideCounter">1 / ${slides.length}</span>
    <button id="nextBtn">Next</button>
  </div>

  <script>
    ${getPresentationJS(slides.length)}
  </script>
</body>
</html>`

  return {
    content: presentationHTML,
    contentType: "text/html",
    filename: `${projectInfo.name.replace(/[^a-zA-Z0-9]/g, "-")}-presentation.html`,
  }
}

// Helper functions for HTML generation
function generateColorsHTML(colors: any[], template: string): string {
  const colorCards = colors
    .map(
      (color) => `
    <div class="color-card">
      <div class="color-swatch" style="background-color: ${color.value}"></div>
      <div class="color-info">
        <h4 class="color-name">${color.name}</h4>
        <div class="color-value" title="Click to copy">${color.value}</div>
        <p class="color-description">${color.description || ""}</p>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <section id="colors" class="section">
      <h2>Colors</h2>
      <div class="color-grid">
        ${colorCards}
      </div>
    </section>
  `
}

function generateTypographyHTML(typography: any[], template: string): string {
  const typeCards = typography
    .map(
      (typo) => `
    <div class="typography-card">
      <div class="type-sample" style="font-family: ${typo.value.fontFamily}; font-size: ${typo.value.fontSize}px; font-weight: ${typo.value.fontWeight};">
        The quick brown fox jumps over the lazy dog
      </div>
      <div class="type-info">
        <h4>${typo.name}</h4>
        <div class="type-specs">
          <span>Font: ${typo.value.fontFamily}</span>
          <span>Size: ${typo.value.fontSize}px</span>
          <span>Weight: ${typo.value.fontWeight}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <section id="typography" class="section">
      <h2>Typography</h2>
      <div class="typography-grid">
        ${typeCards}
      </div>
    </section>
  `
}

function generateComponentsHTML(components: any[], template: string): string {
  const componentsByCategory = components.reduce((acc: any, component: any) => {
    const category = component.category || "General"
    if (!acc[category]) acc[category] = []
    acc[category].push(component)
    return acc
  }, {})

  const categoryHTML = Object.entries(componentsByCategory)
    .map(([category, comps]: [string, any]) => {
      const componentCards = comps
        .map(
          (component: any) => `
      <div class="component-card">
        <h4>${component.name}</h4>
        <p class="component-type">${component.type}</p>
        <p class="component-description">${component.description}</p>
        ${component.usage > 0 ? `<div class="component-usage">Used ${component.usage} times</div>` : ""}
      </div>
    `,
        )
        .join("")

      return `
      <div class="component-category">
        <h3>${category}</h3>
        <div class="component-grid">
          ${componentCards}
        </div>
      </div>
    `
    })
    .join("")

  return `
    <section id="components" class="section">
      <h2>Components</h2>
      ${categoryHTML}
    </section>
  `
}

function generateSpacingHTML(spacing: any[], template: string): string {
  const spacingCards = spacing
    .map(
      (space) => `
    <div class="spacing-card">
      <div class="spacing-visual" style="width: ${space.value}; height: 20px; background: #007acc;"></div>
      <div class="spacing-info">
        <strong>${space.name}</strong>
        <span>${space.value}</span>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <section id="spacing" class="section">
      <h2>Spacing</h2>
      <div class="spacing-grid">
        ${spacingCards}
      </div>
    </section>
  `
}

function generateEffectsHTML(effects: any[], template: string): string {
  const effectCards = effects
    .map(
      (effect) => `
    <div class="effect-card">
      <div class="effect-preview" style="box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></div>
      <div class="effect-info">
        <h4>${effect.name}</h4>
        <p>${effect.type}</p>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <section id="effects" class="section">
      <h2>Effects</h2>
      <div class="effects-grid">
        ${effectCards}
      </div>
    </section>
  `
}

function generateSummaryHTML(summary: any, template: string): string {
  const recommendations = summary.recommendations?.map((rec: string) => `<li>${rec}</li>`).join("") || ""

  return `
    <section id="summary" class="section">
      <h2>Summary</h2>
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-number">${summary.totalComponents}</div>
          <div class="stat-label">Components</div>
        </div>
        <div class="stat">
          <div class="stat-number">${summary.totalColors}</div>
          <div class="stat-label">Colors</div>
        </div>
        <div class="stat">
          <div class="stat-number">${summary.totalTextStyles}</div>
          <div class="stat-label">Text Styles</div>
        </div>
        <div class="stat">
          <div class="stat-number">${summary.designSystemScore}</div>
          <div class="stat-label">DS Score</div>
        </div>
      </div>
      ${
        recommendations
          ? `
        <div class="recommendations">
          <h3>Recommendations</h3>
          <ul>${recommendations}</ul>
        </div>
      `
          : ""
      }
    </section>
  `
}

function getBaseCSS(theme: string, template: string): string {
  return `
    :root {
      --primary: ${theme === "dark" ? "#ffffff" : "#000000"};
      --secondary: ${theme === "dark" ? "#cccccc" : "#666666"};
      --background: ${theme === "dark" ? "#1a1a1a" : "#ffffff"};
      --surface: ${theme === "dark" ? "#2a2a2a" : "#f8f9fa"};
      --border: ${theme === "dark" ? "#404040" : "#e1e5e9"};
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--primary);
      background: var(--background);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header {
      text-align: center;
      padding: 60px 0;
      border-bottom: 1px solid var(--border);
    }

    .header h1 {
      font-size: 3rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.2rem;
      color: var(--secondary);
      margin-bottom: 20px;
    }

    .meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .meta a {
      color: #007acc;
      text-decoration: none;
    }

    .navigation {
      position: sticky;
      top: 0;
      background: var(--background);
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
      z-index: 100;
    }

    .navigation ul {
      display: flex;
      justify-content: center;
      gap: 30px;
      list-style: none;
      flex-wrap: wrap;
    }

    .navigation a {
      color: var(--secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .navigation a:hover {
      color: var(--primary);
    }

    .content {
      padding: 40px 0;
    }

    .section {
      margin-bottom: 80px;
    }

    .section h2 {
      font-size: 2.5rem;
      margin-bottom: 40px;
      text-align: center;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 30px;
    }

    .color-card {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
      transition: transform 0.2s;
    }

    .color-card:hover {
      transform: translateY(-2px);
    }

    .color-swatch {
      height: 120px;
      width: 100%;
    }

    .color-info {
      padding: 20px;
    }

    .color-name {
      font-size: 1.1rem;
      margin-bottom: 8px;
    }

    .color-value {
      font-family: 'Monaco', 'Menlo', monospace;
      background: var(--background);
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-block;
      margin-bottom: 10px;
      transition: background 0.2s;
    }

    .color-value:hover {
      background: var(--border);
    }

    .color-value.copied {
      background: #4caf50;
      color: white;
    }

    .typography-grid {
      display: grid;
      gap: 30px;
    }

    .typography-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 30px;
      border: 1px solid var(--border);
    }

    .type-sample {
      margin-bottom: 20px;
      padding: 20px;
      background: var(--background);
      border-radius: 8px;
    }

    .type-specs {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .type-specs span {
      background: var(--background);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .stat {
      text-align: center;
      background: var(--surface);
      padding: 30px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: #007acc;
      margin-bottom: 10px;
    }

    .stat-label {
      color: var(--secondary);
      font-weight: 500;
    }

    .component-category {
      margin-bottom: 50px;
    }

    .component-category h3 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: var(--secondary);
    }

    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .component-card {
      background: var(--surface);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .component-card h4 {
      margin-bottom: 8px;
    }

    .component-type {
      color: var(--secondary);
      font-size: 0.9rem;
      margin-bottom: 10px;
    }

    .component-usage {
      margin-top: 10px;
      font-size: 0.9rem;
      color: #007acc;
    }

    .footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid var(--border);
      color: var(--secondary);
    }

    .footer a {
      color: #007acc;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 2rem;
      }
      
      .navigation ul {
        gap: 15px;
      }
      
      .color-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
      }
      
      .summary-stats {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
      }
    }
  `
}

function getPresentationCSS(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: white;
      overflow: hidden;
    }

    .presentation {
      height: 100vh;
      position: relative;
    }

    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.5s ease;
    }

    .slide.active {
      opacity: 1;
      transform: translateX(0);
    }

    .title-slide {
      text-align: center;
    }

    .title-slide h1 {
      font-size: 4rem;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .title-slide h2 {
      font-size: 2rem;
      color: #cccccc;
      margin-bottom: 40px;
    }

    .slide h2 {
      font-size: 3rem;
      margin-bottom: 60px;
      text-align: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 40px;
      width: 100%;
      max-width: 800px;
    }

    .stat {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 40px 20px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 10px;
    }

    .stat-label {
      color: #cccccc;
      font-size: 1.1rem;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;
      width: 100%;
      max-width: 1000px;
    }

    .color-card {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }

    .color-swatch {
      width: 100%;
      height: 100px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .color-name {
      font-weight: 600;
      margin-bottom: 5px;
    }

    .color-value {
      font-family: monospace;
      color: #cccccc;
    }

    .typography-grid {
      display: grid;
      gap: 40px;
      width: 100%;
      max-width: 1000px;
    }

    .type-example {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 30px;
      backdrop-filter: blur(10px);
    }

    .type-sample {
      margin-bottom: 20px;
      text-align: center;
    }

    .type-details {
      text-align: center;
      color: #cccccc;
    }

    .controls {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 20px;
      align-items: center;
      background: rgba(0, 0, 0, 0.8);
      padding: 15px 25px;
      border-radius: 25px;
      backdrop-filter: blur(10px);
    }

    .controls button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }

    .controls button:hover {
      background: #5a6fd8;
    }

    .controls button:disabled {
      background: #444;
      cursor: not-allowed;
    }

    #slideCounter {
      color: #cccccc;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .slide {
        padding: 30px;
      }
      
      .title-slide h1 {
        font-size: 2.5rem;
      }
      
      .slide h2 {
        font-size: 2rem;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
      
      .color-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }
  `
}

function getPresentationJS(totalSlides: number): string {
  return `
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slideCounter = document.getElementById('slideCounter');

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[n].classList.add('active');
      
      prevBtn.disabled = n === 0;
      nextBtn.disabled = n === slides.length - 1;
      
      slideCounter.textContent = \`\${n + 1} / \${slides.length}\`;
    }

    function nextSlide() {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    // Initialize
    showSlide(0);
  `
}
