# MyNet GUI 门禁 —— 统一入口（模板：mynet_ctl/docs/knowledge-base/templates/Makefile）
# 用法：make lint | make test | make guard | make check | make install-hooks
#
# 守护机制（AGENTS.md §2.6）：
#   make        = 显式入口，随时可跑
#   pre-commit  → make guard   （轻量：安全红线 + 文件名，秒级）
#   pre-push    → make check   （重量：lint + test）
#
# 与 Go/PHP 仓不同之处（都是本仓实测出来的，不是照抄模板注释）：
#   · lint 除 eslint 还跑 check:i18n。它抓的是「模板里用了不存在的 i18n 键」，
#     这类错运行时不报错，只把键的字面量印在界面上 —— 装这道闸的当场就抓到一处
#     （`layouts/MainLayout.vue` 曾引用两语都无此键的 `profile.preferences`，
#     现已改指 `user.preferences`；留着这条是因为它说明了这道闸为什么值得装）。
#   · `vitest run` 在 "No test files found" 时 exit 1。首个套件落地前（2026-10-05
#     src/utils/__tests__/ 起）不能拿它把 push 永久堵死，也不能加 `--passWithNoTests`
#     装绿（AGENTS.md §2.6：「没东西可查」型门禁等于没有门禁）。所以这里自己数套件：
#     零用例就**响着**放行、并把 M0 的「单元测试可运行」按未达标处理（见 §10）；
#     有套件才真跑 vitest。
#   · 类型检查是**棘轮**（`dev-tools/check-types.js` + `typecheck-baseline.json`）：
#     自有源码实测带一批存量错，清它是另一件事；设成「必须 0 错」
#     = 每次 push 被历史债堵死，结局一定是有人 `--no-verify`。所以判据取**逐文件条数**
#     而不是退出码：只许降不许升。放宽要显式跑 `npm run check:types:update`，改动进 diff。
#     存量条数**只记在** `typecheck-baseline.json` 的 `total` 里，别在这里复述一份数字。
#   · 根 `tsconfig.json` 原先是 `.quasar/tsconfig.json` 的**逐字副本**，而那份里的相对路径
#     是按 `.quasar/` 为基准写的（`include: "./../**/*"`）⇒ 从仓库根跑 vue-tsc / IDE 会把
#     workspace 父目录整个拖进检查（实测多报 485 条，其中 389 条在 `../mynet_api`）。
#     现在根文件只做 `extends`，两种跑法结果一致。

.PHONY: lint test guard check install-hooks

lint:
	@echo "▸ lint（eslint）"
	@npm run lint
	@echo "▸ lint（i18n 键一致性）"
	@npm run check:i18n
	@echo "▸ lint（类型检查 · 棘轮）"
	@npm run check:types

test:
	@echo "▸ test（vitest）"
	@n=$$(find . -type f \( -name '*.test.ts' -o -name '*.spec.ts' -o -name '*.test.js' -o -name '*.spec.js' -o -name '*.test.tsx' -o -name '*.spec.tsx' \) -not -path './node_modules/*' -not -path './dist/*' -not -path './.quasar/*' | wc -l | tr -d ' '); \
	if [ "$$n" = "0" ]; then \
		echo "  ⚠⚠ 本仓零用例：vitest 没有任何 *.test / *.spec 可跑 —— 本次**未执行任何测试**"; \
		echo "  ⚠⚠ M0「单元测试可运行」按**未达标**记（MYNET_V1_PLAYBOOK.md §10），补进第一个套件即撤销本告警"; \
	else \
		echo "  · 用例文件 $$n 个"; \
		npm run test:unit; \
	fi

guard:
	@echo "▸ guard（安全红线）"
	@sh .githooks/guard.sh
	@sh dev-tools/check-no-back-url.sh

check: guard lint test
	@echo "✓ check 通过"

install-hooks:
	@git config core.hooksPath .githooks
	@chmod +x .githooks/*
	@echo "✓ hooks 已安装（core.hooksPath = .githooks）"
