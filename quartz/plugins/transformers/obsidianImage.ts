import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import { Root } from "hast"

export const ObsidianImageFix: QuartzTransformerPlugin = () => {
  return {
    name: "ObsidianImageFix",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "element", (node: any) => {
            if (node.tagName === "img") {
              const src: string = node.properties?.src ?? ""
              const alt: string = node.properties?.alt ?? ""

              // 问题 1：修复绝对路径 → 相对路径
              // 如果 src 以 / 开头但不是真正的根路径资源，去掉开头的 /
              if (src.startsWith("/attachments/") || src.startsWith("/assets/")) {
                node.properties.src = src.slice(1) // 去掉开头的 /
              }

              // 问题 2：把 alt 中的纯数字当宽度处理
              // Obsidian 语法: ![200](path) 或 ![200x300](path)
              const sizeMatch = alt.match(/^(\d+)(?:x(\d+))?$/)
              if (sizeMatch) {
                const width = sizeMatch[1]
                const height = sizeMatch[2]
                node.properties.width = width
                if (height) node.properties.height = height
                node.properties.alt = "" // 清空 alt 或设为有意义的值
                // 也可以加内联样式作为兜底
                node.properties.style = `width:${width}px;${height ? `height:${height}px;` : "max-height:unset;"}`
              }
            }
          })
        },
      ]
    },
  }
}