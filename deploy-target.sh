#!/bin/bash

# 部署目标唯一来源（G1-b 收敛，2026-10-13）
#
# 背景：rollback.sh / pre-deploy-check.sh 曾指向旧 dsplat 主机与目录
# （112.124.22.220:/alidata/www/dsplat.com/mynet.dsplat.com/front），真回滚会
# `rm -rf` 旧目录、救不了现行站点。四个脚本（deployment / quick-deploy /
# rollback / pre-deploy-check）现在全部从本文件取目标，改部署目标只改这里。
#
# 注意：REMOTE_HOST 是 GUI 静态文件服务器（nginx 在此处代理 API），勿改成后端地址。

REMOTE_USER="root"
REMOTE_HOST="my.mynet.club"
REMOTE_PATH="/data/app/mynet.club/my/public"
