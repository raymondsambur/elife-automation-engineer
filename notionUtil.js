import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const databaseId = process.env.NOTION_DATABASE_ID;

export async function updateTestCase(testCaseId, status, notes) {
  await notion.pages.update({
    page_id: testCaseId,
    properties: {
      Status: {
        select: {
          name: status,
        },
      },
      Notes: {
        rich_text: [
          {
            text: {
              content: notes,
            },
          },
        ],
      },
    },
  });
}
