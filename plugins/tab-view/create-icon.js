const fs = require('fs');
const { createCanvas } = require('canvas');

// 48x48のキャンバスを作成
const canvas = createCanvas(48, 48);
const ctx = canvas.getContext('2d');

// 背景を青色のグラデーションで塗りつぶし
const gradient = ctx.createLinearGradient(0, 0, 48, 48);
gradient.addColorStop(0, '#3b82f6');
gradient.addColorStop(1, '#2563eb');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 48, 48);

// タブの形を描画（3つのタブ）
ctx.fillStyle = '#ffffff';

// タブ1（左、非アクティブ）
ctx.globalAlpha = 0.6;
ctx.beginPath();
ctx.moveTo(6, 32);
ctx.lineTo(6, 16);
ctx.lineTo(8, 14);
ctx.lineTo(14, 14);
ctx.lineTo(16, 16);
ctx.lineTo(16, 32);
ctx.closePath();
ctx.fill();

// タブ2（中央、アクティブ）
ctx.globalAlpha = 1.0;
ctx.beginPath();
ctx.moveTo(18, 32);
ctx.lineTo(18, 12);
ctx.lineTo(20, 10);
ctx.lineTo(28, 10);
ctx.lineTo(30, 12);
ctx.lineTo(30, 32);
ctx.closePath();
ctx.fill();

// タブ3（右、非アクティブ）
ctx.globalAlpha = 0.6;
ctx.beginPath();
ctx.moveTo(32, 32);
ctx.lineTo(32, 16);
ctx.lineTo(34, 14);
ctx.lineTo(40, 14);
ctx.lineTo(42, 16);
ctx.lineTo(42, 32);
ctx.closePath();
ctx.fill();

// コンテンツエリア（白い長方形）
ctx.globalAlpha = 1.0;
ctx.fillStyle = '#ffffff';
ctx.fillRect(4, 32, 40, 10);

// 影を追加
ctx.globalAlpha = 0.3;
ctx.fillStyle = '#000000';
ctx.fillRect(4, 42, 40, 1);

// PNGとして保存
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('plugin/icon.png', buffer);

console.log('アイコンを作成しました: plugin/icon.png');
