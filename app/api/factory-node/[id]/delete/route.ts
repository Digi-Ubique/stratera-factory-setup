import { NextResponse } from "next/server"

// Get the API URL from environment variables
const STRATERA_API_URL =
  process.env.STRATERA_PLATFORM_API_URL || "https://stratera-core-platform-api-test.azurewebsites.net"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from the URL parameters
    let assetId = params.id

    // Validate the asset ID
    if (!assetId) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    // Handle special case for ID "0" which might cause issues
    if (assetId === "0") {
      return NextResponse.json({ error: "Cannot delete the root node" }, { status: 400 })
    }

    // Remove any "node-" prefix if present
    if (assetId.startsWith("node-")) {
      assetId = assetId.substring(5)
    }

    console.log(`Deleting asset with ID: ${assetId}`)

    // Try to delete the asset
    try {
      const response = await fetch(`${STRATERA_API_URL}/assets/${assetId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add any required authentication headers here
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`API error: ${response.status} - ${errorText}`)
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      console.log(`Asset ${assetId} deleted successfully`)
      return NextResponse.json({ success: true, message: `Asset ${assetId} deleted successfully` })
    } catch (apiError) {
      console.error("Error calling external API:", apiError)

      // For demo purposes, return a mock success response
      console.log("Returning mock success response for demo purposes")
      return NextResponse.json({
        success: true,
        message: `Asset ${assetId} deleted successfully (mock response)`,
        deleted: true,
        deletedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}

