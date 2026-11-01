// * Đồng bộ danh sách biến từ .env.example sang .env của từng workspace.
// * - Chưa có .env → tạo mới từ .env.example (giá trị để trống).
// * - Đã có .env → chỉ THÊM biến còn thiếu (kèm comment, giá trị trống), không đụng giá trị đã điền.
// * - Báo biến có trong .env mà không có trong .env.example (cần bổ sung vào file mẫu).
// * Chạy: npm run env:sync
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const { workspaces = [] } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

const KEY_LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/;

// * Trả về [{ key, comments: [...] }] theo thứ tự trong file mẫu.
function parseExample(content) {
  const entries = [];
  let comments = [];
  for (const line of content.split(/\r?\n/)) {
    const match = KEY_LINE.exec(line);
    if (match) {
      entries.push({ key: match[1], comments });
      comments = [];
    } else if (line.trim().startsWith("#")) comments.push(line);
    else comments = [];
  }
  return entries;
}

function parseKeys(content) {
  return new Set(
    content
      .split(/\r?\n/)
      .map((line) => KEY_LINE.exec(line)?.[1])
      .filter(Boolean),
  );
}

let hasWarning = false;

for (const workspace of workspaces) {
  const examplePath = join(ROOT, workspace, ".env.example");
  const envPath = join(ROOT, workspace, ".env");
  if (!existsSync(examplePath)) continue;

  const exampleEntries = parseExample(readFileSync(examplePath, "utf8"));

  if (!existsSync(envPath)) {
    const content = exampleEntries
      .map(({ key, comments }) => [...comments, `${key}=`].join("\n"))
      .join("\n");
    writeFileSync(envPath, `${content}\n`);
    console.log(`[${workspace}] Tạo .env mới, ${exampleEntries.length} biến đang chờ điền.`);
    continue;
  }

  const envContent = readFileSync(envPath, "utf8");
  const envKeys = parseKeys(envContent);
  const missing = exampleEntries.filter(({ key }) => !envKeys.has(key));

  if (missing.length > 0) {
    const block = missing.map(({ key, comments }) => [...comments, `${key}=`].join("\n")).join("\n");
    const prefix = envContent.endsWith("\n") || envContent === "" ? "" : "\n";
    appendFileSync(envPath, `${prefix}\n${block}\n`);
    console.log(`[${workspace}] Thêm biến trống vào .env: ${missing.map((e) => e.key).join(", ")}`);
  } else {
    console.log(`[${workspace}] .env đã đủ biến.`);
  }

  const exampleKeys = new Set(exampleEntries.map((e) => e.key));
  const extra = [...envKeys].filter((key) => !exampleKeys.has(key));
  if (extra.length > 0) {
    hasWarning = true;
    console.warn(`[${workspace}] Biến có trong .env nhưng thiếu ở .env.example: ${extra.join(", ")}`);
  }
}

if (hasWarning) process.exitCode = 1;
