import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  console.log("context", JSON.stringify(context, null, 2));

  const result = await streamObject({
    model: openai("gpt-4-turbo"),
    schema: z.object({
      results: z.array(
        z.object({
          index: z.number(),
          people: z.number(),
          position: z.string(),
          action: z.string(),
          hand: z.string(),
          explanation: z.string(),
          result: z.boolean(),
        }),
      ),
    }),
    prompt: `ポーカーのAを含むプリフロップのすべてのハンドに対してアクションが正しかったのか診断してください。\nindexは順番です,そのまま返してください。\npeopleはプレイヤーの数です。\npositionはプレイヤーの位置です,「utg」や「btn」などの略語です。\nactionはプレイヤーのアクションです,「fold」や「3bet」などの略語です。\nhandはハンドを指します.数字とsuitedかoffsuitedかを表します。\nexplanationは日本語の文章で指摘をお願いします。\nresultは正しいかどうかの真偽値です。\nexplanationとresult以外は受け取ったJSONの値をそのまま返してください。`,
    // prompt: `JSON:${context}\n受け取ったJSONをみてそのindex回のポーカーのプリフロップのアクションが正しかったのか診断してください。
    // indexは順番です,そのまま返してください.
    // peopleはプレイヤーの数です.
    // positionはプレイヤーの位置です,「utg」や「btn」などの略語です.
    // actionはプレイヤーのアクションです,「fold」や「3bet」などの略語です.
    // handはハンドを指します.数字とsuitedかoffsuitedかを表します.
    // explanationは日本語の文章で指摘をお願いします。
    // resultは正しいかどうかの真偽値です。
    // explanationとresult以外は受け取ったJSONの値をそのまま返してください。`,
  });

  return result.toTextStreamResponse();
}
