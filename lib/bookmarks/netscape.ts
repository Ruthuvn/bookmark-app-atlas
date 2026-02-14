export type FlatImportedBookmark = {
  categoryName: string;
  title: string;
  url: string;
};

function decodeHtmlEntities(input: string): string {
  // Minimal entity decoding for bookmark titles/folder names.
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => {
      const codePoint = Number(num);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _;
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _;
    });
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

function extractInnerText(tagHtml: string): string {
  // e.g. <H3 ...>Google</H3> or <A ...>Title</A>
  const gt = tagHtml.indexOf(">");
  if (gt === -1) return "";
  const inner = tagHtml.slice(gt + 1).replace(/<\/(H3|A)>/i, "");
  return decodeHtmlEntities(stripTags(inner)).trim();
}

function getAttr(tagHtml: string, attrName: string): string | null {
  // Matches attr="..." or attr='...' or attr=bare
  const re = new RegExp(
    `\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const match = tagHtml.match(re);
  return match ? match[1] ?? match[2] ?? match[3] ?? null : null;
}

function normalizeCategoryName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

export function parseNetscapeBookmarksFlat(
  html: string
): FlatImportedBookmark[] {
  // Parses Netscape bookmark HTML format into flat bookmarks.
  // Flattening rule:
  // - The first folder (typically PERSONAL_TOOLBAR_FOLDER="true") is treated as root and ignored for categorization.
  // - The first folder under root becomes the category.
  // - Any deeper nested folders do NOT create categories; their bookmarks map to that top-level category.
  // - Bookmarks directly under root map to category "Bookmarks".

  // Extract only relevant tags in document order.
  const tokenRe =
    /<\/DL\b[^>]*>|<DL\b[^>]*>|<H3\b[^>]*>[\s\S]*?<\/H3>|<A\b[^>]*>[\s\S]*?<\/A>/gi;

  const folderStack: string[] = [];
  let pendingFolderName: string | null = null;
  let rootFolderName: string | null = null;

  const results: FlatImportedBookmark[] = [];

  const tokens = html.match(tokenRe) ?? [];

  for (const token of tokens) {
    if (/^<H3\b/i.test(token)) {
      const name = normalizeCategoryName(extractInnerText(token));
      if (!name) continue;

      pendingFolderName = name;

      // Root folder is typically marked with PERSONAL_TOOLBAR_FOLDER.
      const isRoot =
        /PERSONAL_TOOLBAR_FOLDER\s*=\s*(?:"true"|'true'|true)/i.test(token);

      if (!rootFolderName && isRoot) {
        rootFolderName = name;
      }

      // Fallback: if we never see PERSONAL_TOOLBAR_FOLDER, treat the first folder as root.
      if (!rootFolderName && folderStack.length === 0) {
        rootFolderName = name;
      }

      continue;
    }

    if (/^<DL\b/i.test(token)) {
      if (pendingFolderName) {
        folderStack.push(pendingFolderName);
        pendingFolderName = null;
      } else {
        // A DL can exist at the very top without an H3; track structure with a placeholder.
        folderStack.push("");
      }
      continue;
    }

    if (/^<\/DL\b/i.test(token)) {
      folderStack.pop();
      continue;
    }

    if (/^<A\b/i.test(token)) {
      const href = getAttr(token, "HREF")?.trim();
      if (!href) continue;

      const title = extractInnerText(token) || href;

      // Determine category name.
      const stackFolders = folderStack.filter((x) => x && x.trim());

      let categoryName = "Bookmarks";
      if (rootFolderName && stackFolders[0] === rootFolderName) {
        categoryName = stackFolders[1] ?? "Bookmarks";
      } else {
        categoryName = stackFolders[0] ?? "Bookmarks";
      }

      categoryName = normalizeCategoryName(categoryName) || "Bookmarks";

      results.push({ categoryName, title, url: href });
      continue;
    }
  }

  return results;
}
