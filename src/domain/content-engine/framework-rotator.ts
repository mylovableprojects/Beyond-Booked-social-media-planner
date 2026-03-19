import { CONTENT_FRAMEWORKS, type ContentFramework } from "@/types/platform";

export function getFrameworkForPost(postIndex: number): ContentFramework {
  return CONTENT_FRAMEWORKS[postIndex % CONTENT_FRAMEWORKS.length];
}
