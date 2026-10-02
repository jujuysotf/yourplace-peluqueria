// server/handlers/health.ts
function GET() {
  return Response.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
}
export {
  GET
};
