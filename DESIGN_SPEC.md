# UI/UX Design Specification: UMKM Health Scoring Dashboard (Disertasi Bu Novi)

## 1. Overview
This specification provides complete design tokens, layout wireframes, component architectures, and user flow documentation for the UMKM Health Scoring website (dissertation project of Bu Novi).

## 2. Design Tokens & Visual System
- **Primary Palette**: Deep Teal (`#0F766E`), Teal Light (`#0D9488`), Teal Dark (`#115E59`)
- **Secondary Palette**: Sky Blue (`#0369A1`)
- **Health Score Categories**:
  - Sangat Sehat (80–100): Green (`#16A34A`)
  - Cukup Sehat (65–79): Yellow (`#CA8A04`)
  - Kurang Sehat (50–64): Orange (`#EA580C`)
  - Tidak Sehat (0–49): Red (`#DC2626`)
- **Typography**: Inter (System sans-serif fallback)
- **Spacing / Radius**: 4px scale, 8px (`--radius-md`), 12px (`--radius-lg`), 16px (`--radius-xl`)

## 3. Core Screens & User Flows
1. **Landing & Dashboard Overview (`01_Dashboard_Overview.svg` / `UMKM_Health_Scoring_Dashboard.html`)**
   - Hero banner with quick action to start assessment.
   - Aggregate metric cards (Total UMKM, National Score, Sehat %, Intervention %).
   - Sector distribution bar chart & recent assessment table.
2. **Health Scoring Input Wizard (`02_Input_Form_Wizard.svg`)**
   - **Step 1**: Company Profile (Name, NPWP, Sector, Province, City, Founded Year, Address, Employee Range).
   - **Step 2**: Financial Statements (Balance Sheet: Cash, Receivables, Inventory, Fixed Assets, Payables, Debt, Equity; Income Statement: Revenue, COGS, Operating Expenses, Interest, Tax, Net Income).
   - **Step 3**: Operational & Legal Indicators (Legal Status, Product Certification, Digital Marketing adoption, Years of Operation, Last Year's Turnover, Funding Access).
3. **Results Display (`03_Results_Display.svg`)**
   - Circular health score gauge (0–100) with classification badge.
   - 6-dimension Radar Chart (Liquidity, Solvency, Profitability, Efficiency, Growth, Legal).
   - Financial ratio analysis table (Current Ratio, DER, NPM, ROE, ROA, Turnover ratios).
   - AI-powered recommendation cards with actionable interventions.
   - Export options (PDF, Excel, WhatsApp sharing).

## 4. Deliverables in Workspace
- `UMKM_Health_Scoring_Dashboard.html`: Fully interactive, responsive HTML/CSS/JS prototype.
- `figma_design_tokens.json`: DTCG-compliant design token file.
- `figma_assets.json`: Component and frame manifest.
- `figma_assets/`: Folder containing clean SVG vector assets for direct Figma import (`01_dashboard_overview.svg`, `02_input_form_wizard.svg`, `03_results_display.svg`, `04_component_library.svg`).
