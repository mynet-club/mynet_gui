# public/tips-kb.json —— tips/小助手知识库离线基线

本文件是 tips/小助手知识库（tips-kb）的**离线基线**，随 GUI 发行版分发（契约 §3.1）。

- **真蒸馏产物**，同步自 `mynet_ctl` 仓 `scripts/tips-kb/tips-kb.json`
  （生成器 `scripts/tips-kb/build_tips_kb.py`，当前 `version` 以 JSON 内字段为准）。
- **不要手改本文件当源**——知识库 md 是 SSOT，JSON 是构建产物（契约 §3.2）；
  源变更后在 ctl 侧重跑生成器，再整体替换本文件。
- 形状判据：`mynet_ctl/docs/knowledge-base/spec/schemas/tips-kb.schema.json`。

契约正文：`mynet_ctl/docs/knowledge-base/spec/tips-kb-contract.md`。
