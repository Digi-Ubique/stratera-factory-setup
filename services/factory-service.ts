import type { TreeNode } from "@/components/factory/tree-view"
import type { GraphData, GraphNode } from "@/components/factory/graph-view"

// Define the API response type
interface AssetData {
  asset_id?: string
  id?: string
  name?: string
  description?: string
  code?: string
  type?: string
  parent_id?: string | null
  status?: string
  parameters?: {
    shift?: Record<string, any>
    specs?: {
      demographics?: {
        city?: string
        country?: string
      }
    }
  }
  created_by?: string
  created_timestamp?: string
  updated_by?: string
  updated_timestamp?: string
  approved_by?: string
  approved_timestamp?: string
  eff_date_from?: string
  eff_date_to?: string
}

// Fetch factory hierarchy data from the API
export async function fetchFactoryHierarchy(): Promise<{ treeData: TreeNode[]; graphData: GraphData }> {
  try {
    // Determine which API to use based on environment
    const apiUrl = process.env.NEXT_PUBLIC_MOCK_API === "true" ? "/api/mock/factory-api" : "/api/factory-hierarchy"

    console.log("Fetching factory hierarchy from:", apiUrl)

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("API response received:", data)

    // If the response is already in the expected format
    if (data.nodes && data.links) {
      console.log("Data is in graph format with nodes and links")
      const graphData = data as GraphData
      const treeData = convertGraphNodesToTreeNodes(graphData.nodes)
      return { treeData, graphData }
    }

    // If the response is an array of assets
    if (Array.isArray(data)) {
      console.log("Data is an array of assets")
      return processAssetData(data)
    }

    // If the response is a single object with assets array
    if (data.assets && Array.isArray(data.assets)) {
      console.log("Data contains assets array")
      return processAssetData(data.assets)
    }

    console.error("Unexpected API response format:", data)
    throw new Error("Unexpected API response format")
  } catch (error) {
    console.error("Error fetching factory hierarchy:", error)
    throw error
  }
}

// Process asset data into tree and graph formats
function processAssetData(assets: AssetData[]): { treeData: TreeNode[]; graphData: GraphData } {
  const nodes: GraphNode[] = []
  const links: { source: string; target: string; type: string }[] = []

  // Create nodes
  assets.forEach((asset) => {
    // Get the ID using either asset_id or id property
    const assetId = asset.asset_id || asset.id

    if (!assetId) {
      console.warn("Asset missing ID:", asset)
      return
    }

    const node: GraphNode = {
      id: assetId,
      label: asset.name || asset.description || `Asset ${assetId}`,
      type: asset.type || "workstation",
      code: asset.code || "",
      status: asset.status || "active",
      x: Math.random() * 800,
      y: Math.random() * 600,
      assetData: asset,
    }

    nodes.push(node)
  })

  // Create links
  assets.forEach((asset) => {
    const assetId = asset.asset_id || asset.id
    const parentId = asset.parent_id

    if (assetId && parentId) {
      links.push({
        source: parentId,
        target: assetId,
        type: "parent-child",
      })
    }
  })

  const graphData: GraphData = { nodes, links }
  const treeData = convertGraphNodesToTreeNodes(nodes)

  return { treeData, graphData }
}

// Convert graph nodes to tree nodes
function convertGraphNodesToTreeNodes(nodes: GraphNode[]): TreeNode[] {
  // Create a map of nodes by ID
  const nodeMap = new Map<string, GraphNode>()
  nodes.forEach((node) => {
    nodeMap.set(node.id, node)
  })

  // Find root nodes (nodes without parents)
  const rootNodes: TreeNode[] = []

  nodes.forEach((node) => {
    const parentId = node.assetData?.parent_id

    if (!parentId) {
      // This is a root node
      const treeNode: TreeNode = {
        id: node.id,
        label: node.label,
        type: node.type,
        code: node.code || "",
        status: node.status || "active",
        children: [],
        assetData: node.assetData,
      }
      rootNodes.push(treeNode)
    }
  })

  // Build the tree recursively
  function buildTree(treeNode: TreeNode) {
    const children = nodes.filter((node) => node.assetData?.parent_id === treeNode.id)

    children.forEach((child) => {
      const childTreeNode: TreeNode = {
        id: child.id,
        label: child.label,
        type: child.type,
        code: child.code || "",
        status: child.status || "active",
        children: [],
        assetData: child.assetData,
      }

      treeNode.children.push(childTreeNode)
      buildTree(childTreeNode)
    })
  }

  // Build the tree for each root node
  rootNodes.forEach((rootNode) => {
    buildTree(rootNode)
  })

  return rootNodes
}

