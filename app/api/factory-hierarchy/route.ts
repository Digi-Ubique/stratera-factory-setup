import { NextResponse } from "next/server"

// Get the API URL from environment variables
const STRATERA_API_URL =
  process.env.STRATERA_PLATFORM_API_URL || "https://stratera-core-platform-api-test.azurewebsites.net"

export async function GET() {
  try {
    console.log("Fetching assets from API:", `${STRATERA_API_URL}/assets?eff_date_to=9999-12-31`)

    // Fetch assets from the Stratera Platform API
    const response = await fetch(`${STRATERA_API_URL}/assets?eff_date_to=9999-12-31`, {
      headers: {
        "Content-Type": "application/json",
        // Add any required authentication headers here
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const assets = await response.json()
    console.log("API response received, assets count:", assets.length)

    // Transform the assets to nodes and links for the hierarchy view
    const { nodes, links } = transformAssetsToHierarchy(assets)

    return NextResponse.json({ nodes, links })
  } catch (error) {
    console.error("Error fetching factory hierarchy data:", error)
    return NextResponse.json({ error: "Failed to fetch factory hierarchy data" }, { status: 500 })
  }
}

// Transform the assets to nodes and links for the hierarchy view
function transformAssetsToHierarchy(assets) {
  const nodes = []
  const links = []
  const nodeMap = new Map()

  // First pass: Create nodes
  assets.forEach((asset) => {
    const node = {
      id: asset.asset_id,
      label: asset.name || asset.description || `Asset ${asset.asset_id}`,
      type: asset.type || "workstation",
      code: asset.code,
      status: asset.status || "active",
      assetData: asset,
    }

    // Add position for graph view (will be adjusted by the simulation)
    node.x = Math.random() * 800
    node.y = Math.random() * 600

    nodes.push(node)
    nodeMap.set(asset.asset_id, node)
  })

  // Second pass: Create links
  assets.forEach((asset) => {
    if (asset.parent_id && nodeMap.has(asset.parent_id)) {
      links.push({
        source: asset.parent_id,
        target: asset.asset_id,
        type: "parent-child",
      })
    }
  })

  return { nodes, links }
}

