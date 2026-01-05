const fs = require('fs');
const { createCanvas } = require('canvas');

// 48x48のキャンバスを作成
const canvas = createCanvas(48, 48);
const ctx = canvas.getContext('2d');

// 背景を緑色のグラデーションで塗りつぶし
const gradient = ctx.createLinearGradient(0, 0, 48, 48);
gradient.addColorStop(0, '#10b981');
gradient.addColorStop(1, '#059669');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 48, 48);

// 条件分岐のフローチャートを描画
ctx.fillStyle = '#ffffff';
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;

// 上部の条件ボックス（菱形）
ctx.beginPath();
ctx.moveTo(24, 8);   // 上
ctx.lineTo(34, 16);  // 右
ctx.lineTo(24, 24);  // 下
ctx.lineTo(14, 16);  // 左
ctx.closePath();
ctx.fill();

// 条件ボックス内に「?」記号
ctx.fillStyle = '#059669';
ctx.font = 'bold 12px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('?', 24, 16);

// 左側の分岐線（非表示パス）
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(24, 24);
ctx.lineTo(16, 32);
ctx.stroke();

// 左側のアクションボックス（非表示）
ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctx.fillRect(10, 32, 12, 8);

// 右側の分岐線（表示パス）
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(24, 24);
ctx.lineTo(32, 32);
ctx.stroke();

// 右側のアクションボックス（表示）
ctx.fillStyle = '#ffffff';
ctx.fillRect(26, 32, 12, 8);

// 目のアイコン（表示を象徴）- 右側のボックス内
ctx.fillStyle = '#059669';
ctx.beginPath();
ctx.ellipse(32, 36, 3, 2, 0, 0, 2 * Math.PI);
ctx.fill();
ctx.fillStyle = '#059669';
ctx.beginPath();
ctx.arc(32, 36, 1, 0, 2 * Math.PI);
ctx.fill();

// 斜線アイコン（非表示を象徴）- 左側のボックス内
ctx.strokeStyle = '#059669';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(12, 34);
ctx.lineTo(20, 38);
ctx.stroke();

// PNGとして保存
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('plugin/icon.png', buffer);

console.log('アイコンを作成しました: plugin/icon.png');
