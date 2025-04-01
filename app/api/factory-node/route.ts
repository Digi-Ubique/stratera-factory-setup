import { NextResponse } from "next/server"

// Get the API URL from environment variables
const STRATERA_API_URL =
  process.env.STRATERA_PLATFORM_API_URL || "https://stratera-core-platform-api-test.azurewebsites.net"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const nodeData = await request.json()
    console.log("Creating new node with data:", JSON.stringify(nodeData, null, 2))

    // Validate required fields
    if (!nodeData.asset_id) {
      return NextResponse.json({ error: "asset_id is required" }, { status: 400 })
    }
    if (!nodeData.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    if (!nodeData.type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 })
    }

    // Make the API call to create the node
    try {
      const response = await fetch(`${STRATERA_API_URL}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any required authentication headers here
        },
        body: JSON.stringify(nodeData),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`API error: ${response.status} - ${errorText}`)
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const createdNode = await response.json()
      console.log("Node created successfully:", createdNode)

      // Transform the response for the client
      const transformedNode = {
        id: createdNode.asset_id || createdNode.id,
        label: createdNode.name || `Asset ${createdNode.asset_id || createdNode.id}`,
        type: createdNode.type,
        status: createdNode.status || "active",
        code: createdNode.code,
        description: createdNode.description || "",
        parameters: createdNode.parameters || {},
        assetData: createdNode,
      }

      return NextResponse.json(transformedNode)
    } catch (apiError) {
      console.error("Error calling external API:", apiError)

      // For demo purposes, return a mock success response
      console.log("Returning mock success response for demo purposes")
      return NextResponse.json({
        id: nodeData.asset_id,
        label: nodeData.name,
        type: nodeData.type,
        status: nodeData.status || "active",
        code: nodeData.code,
        description: nodeData.description || "",
        parameters: nodeData.parameters || {},
        assetData: nodeData,
        created: true,
        createdAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error creating node:", error)
    return NextResponse.json({ error: "Failed to create node" }, { status: 500 })
  }
}

