import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

/**
 * Find a Notion page by its ATC unique ID number.
 * Uses the search API to locate pages, then filters by the unique_id property.
 */
export async function findPageByAtcId(atcNumber: number): Promise<string | null> {
  let startCursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const searchResult = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 100,
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });

    for (const page of searchResult.results) {
      // console.log("page", page);
      if (page.object !== "page" || !("properties" in page)) continue;

      const parent = page.parent as Record<string, unknown>;
      const pageDbId = (parent?.database_id as string | undefined)?.replace(/-/g, "");
      const targetDbId = databaseId.replace(/-/g, "");

      if (pageDbId !== targetDbId) continue;
      
      const idProp = page.properties?.["ID"] as {
        type: string;
        unique_id?: { prefix: string; number: number };
      } | undefined;

      if (
        idProp?.type === "unique_id" &&
        idProp.unique_id?.prefix === "ATC" &&
        idProp.unique_id?.number === atcNumber
      ) {
        return page.id;
      }
    }

    hasMore = searchResult.has_more;
    startCursor = searchResult.next_cursor ?? undefined;
  }

  return null;
}

/**
 * Update the test result for a given ATC test case in Notion.
 *
 * @param atcNumber - The ATC number (e.g., 15 for ATC-15)
 * @param status    - "Passed" or "Failed"
 * @param errorMessage - Optional error message for failed tests
 */
export async function updateTestResult(
  atcNumber: number,
  status: "Passed" | "Failed",
  errorMessage?: string,
): Promise<void> {
  const pageId = await findPageByAtcId(atcNumber);

  if (!pageId) {
    console.warn(`[Notion] Could not find page for ATC-${atcNumber}, skipping update.`);
    return;
  }

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: {
        status: {
          name: status,
        },
      },
      "Last Run": {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
  });

  // If the test failed and there's an error message, add it as a comment
  if (status === "Failed" && errorMessage) {
    try {
      await notion.comments.create({
        parent: { page_id: pageId },
        rich_text: [
          {
            text: {
              content: `❌ Test failed: ${errorMessage.slice(0, 1900)}`,
            },
          },
        ],
      });
    } catch (commentErr: unknown) {
      const msg = commentErr instanceof Error ? commentErr.message : String(commentErr);
      console.warn(`[Notion] Could not add failure comment to ATC-${atcNumber}: ${msg}`);
    }
  }

  console.log(`[Notion] ATC-${atcNumber} → ${status}`);
}

/**
 * Shape of a collected test result, used by the batch update flow.
 */
export interface TestResultEntry {
  atcNumber: number;
  status: "Passed" | "Failed";
  errorMessage?: string;
}

/**
 * Batch-update all collected test results in Notion.
 * Call this once after the entire test run finishes.
 */
export async function updateAllTestResults(
  results: TestResultEntry[],
): Promise<void> {
  if (results.length === 0) {
    console.log("[Notion] No test results to update.");
    return;
  }

  console.log(`[Notion] Updating ${results.length} test result(s)...`);

  let successCount = 0;
  let failCount = 0;

  for (const entry of results) {
    try {
      await updateTestResult(entry.atcNumber, entry.status, entry.errorMessage);
      successCount++;
    } catch (err: unknown) {
      failCount++;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Notion] Failed to update ATC-${entry.atcNumber}: ${msg}`);
    }
  }

  console.log(
    `[Notion] Batch complete — ${successCount} updated, ${failCount} failed.`,
  );
}
