import fs from "fs";

const envText = fs.readFileSync(".env", "utf-8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const apiKey = env.HUGGINGFACE_API_KEY;
const model = env.HUGGINGFACE_MODEL || "Qwen/Qwen3.5-35B-A3B";
const apiUrl =
  env.HUGGINGFACE_API_URL || "https://router.huggingface.co/v1/chat/completions";

async function call(label, extra) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "JSON 배열만 출력. 마크다운 없이.",
        },
        {
          role: "user",
          content: '관광 탄소 3문장 JSON 배열: ["a","b","c"] 형식',
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
      ...extra,
    }),
  });

  const json = await res.json();

  const message = json.choices?.[0]?.message;
  console.log(`\n=== ${label} ===`);
  console.log("status:", res.status);
  console.log("finish_reason:", json.choices?.[0]?.finish_reason);
  console.log("content:", JSON.stringify(message?.content)?.slice(0, 400));
  console.log(
    "reasoning_content tail:",
    JSON.stringify(message?.reasoning_content?.slice(-400)),
  );
  if (json.error) console.log("error:", json.error);
}

await call("default", {});
await call("enable_thinking false", {
  chat_template_kwargs: { enable_thinking: false },
});
