import { z } from "zod";

// * validate({ params, query, body, cookies })
//   params:  :id
//   query:   search, sort, paginate
//   body:    form
//   cookies: refreshToken… (cần cookie-parser chạy trước)
// * Kết quả đã parse (trim, lowercase, coerce…) nằm ở req.validated.<part>.

const REQUEST_PARTS = ["params", "query", "body", "cookies"];

export function validate(schemas) {
  return (req, res, next) => {
    const validated = {};
    const issues = [];

    for (const part of REQUEST_PARTS) {
      if (!schemas[part]) continue;

      const result = schemas[part].safeParse(req[part] ?? {});
      if (result.success) validated[part] = result.data;
      else
        issues.push(
          // * Gắn tên phần (body.email, cookies.refreshToken) để client biết lỗi ở đâu.
          ...result.error.issues.map((issue) => ({ ...issue, path: [part, ...issue.path] })),
        );
    }

    if (issues.length > 0) throw new z.ZodError(issues);

    req.validated = validated;
    next();
  };
}
