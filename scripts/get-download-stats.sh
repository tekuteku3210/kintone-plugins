#!/bin/bash
# GitHub Releases ダウンロード数取得スクリプト
# 使い方: ./get-download-stats.sh

REPO="tekuteku3210/kintone-plugins"

echo "=========================================="
echo "  kintone-plugins ダウンロード統計"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# プラグインごとに集計
echo "【プラグイン別 合計ダウンロード数】"
echo "------------------------------------------"

gh api repos/$REPO/releases --jq '
  group_by(.tag_name | capture("(?<name>.+)-v(?<ver>.+)") | .name) |
  map({
    plugin: .[0].tag_name | capture("(?<name>.+)-v(?<ver>.+)") | .name,
    total: [.[].assets[].download_count] | add
  }) |
  sort_by(-.total) |
  .[] |
  "\(.plugin): \(.total) ダウンロード"
'

echo ""
echo "【リリース別 詳細】"
echo "------------------------------------------"

gh api repos/$REPO/releases --jq '
  .[] |
  "\(.tag_name): \(.assets[0].download_count) DL"
'

echo ""
echo "【合計】"
echo "------------------------------------------"
TOTAL=$(gh api repos/$REPO/releases --jq '[.[].assets[].download_count] | add')
echo "全プラグイン合計: $TOTAL ダウンロード"
