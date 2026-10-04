# MyNet GUI 门禁 —— 统一入口（模板：mynet_ctl/docs/knowledge-base/templates/Makefile）
# 用法：make lint | make test | make guard | make check | make install-hooks
#
# 守护机制（AGENTS.md §2.6）：
#   make        = 显式入口，随时可跑
#   pre-commit  → make guard   （轻量：安全红线 + 文件名，秒级）
#   pre-push    → make check   （重量：lint + test）
#
# 与 Go/PHP 仓两处不同（都是本仓实测出来的，不是照抄模板注释）：
#   · lint 除 eslint 还跑 check:i18n。它抓的是「模板里用了不存在的 i18n 键」，
#     这类错运行时不报错，只把键的字面量印在界面上 —— 装这道闸的当场就抓到一处
#     （`layouts/MainLayout.vue` 的 `profile.preferences`，两语都无此键）。
#   · 本仓**当前零用例**，`vitest run` 在 "No test files found" 时 exit 1。
#     不能拿它把 push 永久堵死，也不能加 `--passWithNoTests` 装绿（AGENTS.md §2.6：
#     「没东西可查」型门禁等于没有门禁）。所以这里自己数套件：零用例就**响着**放行，
#     并把 M0 的「单元测试可运行」按未达标处理（见 docs/MYNET_V1_PLAYBOOK.md §10）。

.PHONY: lint test guard check install-hooks

lint:
	@echo "▸ lint（eslint）"
	@npm run lint
	@echo "▸ lint（i18n 键一致性）"
	@npm run check:i18n

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

check: guard lint test
	@echo "✓ check 通过"

install-hooks:
	@git config core.hooksPath .githooks
	@chmod +x .githooks/*
	@echo "✓ hooks 已安装（core.hooksPath = .githooks）"
