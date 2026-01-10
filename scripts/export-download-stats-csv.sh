#!/bin/bash
# GitHub Releases ダウンロード数をCSV出力するスクリプト
# Googleスプレッドシート → Looker Studio連携用
# 使い方: ./export-download-stats-csv.sh > download-stats.csv

REPO="tekuteku3210/kintone-plugins"

# CSVヘッダー
echo "date,plugin_name,release_tag,version,download_count"

# 現在日時
DATE=$(date '+%Y-%m-%d')

# 各リリースのデータを出力
gh api repos/$REPO/releases --jq "
  .[] |
  \"${DATE},\" +
  (.tag_name | capture(\"(?<name>.+)-v(?<ver>.+)\") | .name) + \",\" +
  (.tag_name) + \",\" +
  (.tag_name | capture(\"(?<name>.+)-v(?<ver>.+)\") | .ver) + \",\" +
  (.assets[0].download_count | tostring)
"
