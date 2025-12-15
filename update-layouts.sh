#!/bin/bash

# 모든 페이지에서 "← 메인으로" 링크 제거 및 레이아웃 수정

echo "페이지 레이아웃 일괄 수정 중..."

# 각 페이지 파일 목록
pages=(
  "battle/page.tsx"
  "slots/page.tsx"
  "factions/page.tsx"
  "inventory/page.tsx"
  "enhance/page.tsx"
  "unique-unit/page.tsx"
  "missions/page.tsx"
  "shop/page.tsx"
  "achievements/page.tsx"
  "settings/page.tsx"
  "ranking/page.tsx"
  "pvp/page.tsx"
)

for page in "${pages[@]}"; do
  file="/Users/admin/Desktop/ai-daejeon/frontend/app/$page"
  if [ -f "$file" ]; then
    echo "수정 중: $page"
    # min-h-screen을 h-full로 변경
    sed -i '' 's/min-h-screen/h-full bg-gradient-to-br from-gray-900 via-purple-900\/30 to-gray-900 overflow-auto/g' "$file"
  fi
done

echo "완료!"
