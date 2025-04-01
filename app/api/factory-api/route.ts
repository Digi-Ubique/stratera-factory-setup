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

    // Transform the assets to the format needed for the API view
    const transformedAssets = transformAssetsForApiView(assets)

    return NextResponse.json(transformedAssets)
  } catch (error) {
    console.error("Error fetching factory API data:", error)
    return NextResponse.json({ error: "Failed to fetch factory API data" }, { status: 500 })
  }
}

// Transform the assets data for the API view
function transformAssetsForApiView(assets) {
  return assets.map((asset) => {
    // Map the asset properties to our expected format
    return {
      id: asset.asset_id,
      name: asset.name || `Asset ${asset.asset_id}`,
      type: asset.type || "workstation",
      parent_id: asset.parent_id,
      status: asset.status || "active",
      description: asset.description || `${asset.type} ${asset.asset_id}`,
      code: asset.code,
      // Include the original asset data for reference
      assetData: asset,
    }
  })
}

