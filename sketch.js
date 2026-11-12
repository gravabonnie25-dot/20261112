// 宣告全域變數，用來存放走路、跑步與跳躍/特效的圖片精靈
let walkSprite;
let runSprite;
let jumpSprite;
let activeSprite;

// 預設影格總數與當前影格索引
let totalFrames = 8;
let currentFrame = 0;

// 宣告角色在畫布上的座標、移動速度與朝向
let posX;
let posY;
let speed = 6;       // 角色移動速度
let direction = 1;   // 角色朝向：1 表示朝右，-1 表示朝左

// 宣告控制「空白鍵動作（只執行一次）」的狀態變數
let isJumping = false; // 是否正在執行跳躍動作
let jumpFrame = 0;     // 跳躍動作目前的影格進度（0 ~ 11）

// 宣告存放「飛行特效物件」的陣列，可支援連續發射特效
let effects = [];

// preload 函式會在程式啟動前執行，確保所有圖片資源完全載入
function preload() {
  // 載入走路圖片精靈（8張）
  walkSprite = loadImage('walk/walk.png');
  // 載入跑步圖片精靈（14張）
  runSprite = loadImage('run/run.png');
  // 載入跳躍與特效圖片精靈（12張，總寬160、高225）
  jumpSprite = loadImage('jump/jump.png');
}

// setup 函式在程式啟動時執行一次，用來初始化畫布與變數
function setup() {
  // 建立一個符合瀏覽器視窗大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 設定動畫播放速率（每秒更新 12 個影格，讓 12 張動作更流暢）
  frameRate(12);

  // 將圖片繪製的基準點設為中心，方便精準定位與鏡像翻轉
  imageMode(CENTER);

  // 設定角色初始位置在整個畫布 X 軸的 2/3 處
  posX = width * (2 / 3);
}

// draw 函式會不斷重複執行，負責每一幀的邏輯更新與畫面渲染
function draw() {
  // 設定畫布背景顏色為淡紫色（RGB：紅 230, 綠 220, 藍 250）
  background(230, 220, 250);

  // 設定角色在畫布上顯示的高度為整個畫布高度的 1/3
  let displayHeight = height / 3;

  // 計算角色在畫布上的 Y 軸位置（讓角色最底端貼齊畫布最底端）
  posY = height - (displayHeight / 2);

  // 宣告單格裁切寬高與顯示寬度的變數
  let frameWidth, frameHeight, displayWidth, sx;

  // 判斷目前是否處於「空白鍵跳躍動作」狀態
  if (isJumping) {
    // 切換為跳躍圖片精靈（共 12 張）
    activeSprite = jumpSprite;
    totalFrames = 12;

    // 計算單張影格在原圖中的寬度與高度
    frameWidth = activeSprite.width / totalFrames;
    frameHeight = activeSprite.height;

    // 依據顯示高度與原圖高度的比例，等比例計算顯示寬度
    let scaleRatio = displayHeight / frameHeight;
    displayWidth = frameWidth * scaleRatio;

    // 取得目前跳躍動作的水平裁切起點
    sx = jumpFrame * frameWidth;

    // 繪製角色（包含左右轉向處理）
    drawCharacter(activeSprite, posX, posY, displayWidth, displayHeight, sx, 0, frameWidth, frameHeight, direction);

    // 跳躍影格往前推進一張
    jumpFrame++;

    // 當 12 張圖片全部播放完畢（執行一次結束）
    if (jumpFrame >= totalFrames) {
      isJumping = false; // 結束跳躍狀態，恢復一般狀態
      jumpFrame = 0;     // 重置跳躍影格計數器

      // 動作執行完後，在角色當前位置與朝向產生一個飛行特效物件
      effects.push({
        x: posX,                 // 特效初始 X 座標（與角色相同）
        y: posY,                 // 特效初始 Y 座標（與角色相同）
        dir: direction,          // 特效移動方向（1 往右，-1 往左）
        speed: 15,               // 特效飛行速度
        frame: 0,                // 特效目前的影格索引
        totalFrames: 12          // 特效精靈圖總張數（12 張）
      });
    }
  } 
  // 若非跳躍狀態，則執行原本的「走路 / 跑步 / 左右鍵移動」邏輯
  else {
    // 預設未按鍵或按左鍵時，使用走路圖片精靈（共 8 張）
    activeSprite = walkSprite;
    totalFrames = 8;

    // 計算單張影格寬高與等比例顯示寬度
    frameWidth = activeSprite.width / totalFrames;
    frameHeight = activeSprite.height;
    displayWidth = frameWidth * (displayHeight / frameHeight);

    // 檢查是否持續按住鍵盤「右鍵」
    if (keyIsDown(RIGHT_ARROW)) {
      // 按下右鍵切換為跑步圖片精靈（共 14 張）
      activeSprite = runSprite;
      totalFrames = 14;
      frameWidth = activeSprite.width / totalFrames;
      displayWidth = frameWidth * (displayHeight / activeSprite.height);

      // 設定角色朝向為右側
      direction = 1;

      // 判斷若尚未到達畫布最右端，則繼續往右移動
      if (posX < width - displayWidth / 2) {
        posX += speed;
      }
    } 
    // 檢查是否持續按住鍵盤「左鍵」
    else if (keyIsDown(LEFT_ARROW)) {
      // 設定角色朝向為左側（使用走路精靈圖）
      direction = -1;

      // 判斷若尚未到達畫布最左端，則繼續往左移動
      if (posX > displayWidth / 2) {
        posX -= speed;
      }
    }

    // 確保當前影格索引不超出總張數，並計算水平裁切起點
    currentFrame = currentFrame % totalFrames;
    sx = currentFrame * frameWidth;

    // 繪製角色（包含左右轉向處理）
    drawCharacter(activeSprite, posX, posY, displayWidth, displayHeight, sx, 0, frameWidth, frameHeight, direction);

    // 更新一般狀態的循環動畫影格
    currentFrame = (currentFrame + 1) % totalFrames;
  }

  // 呼叫自訂函式，更新並繪製畫面上所有的飛行特效圖片
  updateAndDrawEffects(displayHeight);
}

// 自訂函式：負責處理角色繪製與水平鏡像翻轉
function drawCharacter(sprite, x, y, dWidth, dHeight, sx, sy, fWidth, fHeight, dir) {
  push();               // 保存當前的畫布座標系統狀態
  translate(x, y);      // 將座標原點移動到目標中心點
  if (dir === -1) {     // 若方向朝左（-1）
    scale(-1, 1);       // 進行水平鏡像翻轉
  }
  // 繪製裁切後的精靈圖影格
  image(sprite, 0, 0, dWidth, dHeight, sx, sy, fWidth, fHeight);
  pop();                // 恢復原本的畫布座標系統狀態
}

// 自訂函式：更新特效位置、播放特效動畫，並在到達畫布邊界時移除
function updateAndDrawEffects(displayHeight) {
  // 計算特效精靈圖（jumpSprite）的單張影格寬高與等比例顯示尺寸
  let efFrameWidth = jumpSprite.width / 12;
  let efFrameHeight = jumpSprite.height;
  let efDisplayHeight = displayHeight;
  let efDisplayWidth = efFrameWidth * (efDisplayHeight / efFrameHeight);

  // 從陣列尾端往前遍歷所有特效物件（方便安全刪除已消失的特效）
  for (let i = effects.length - 1; i >= 0; i--) {
    let ef = effects[i];

    // 根據方向移動特效的 X 座標（dir 為 1 往右加，為 -1 往左減）
    ef.x += ef.speed * ef.dir;

    // 計算特效目前影格的水平裁切起點
    let efSx = ef.frame * efFrameWidth;

    // 繪製特效圖片（同樣依據發射方向決定是否轉向）
    drawCharacter(jumpSprite, ef.x, ef.y, efDisplayWidth, efDisplayHeight, efSx, 0, efFrameWidth, efFrameHeight, ef.dir);

    // 更新特效的動畫影格（循環播放 12 張）
    ef.frame = (ef.frame + 1) % ef.totalFrames;

    // 判斷邊界消失條件：
    // 若特效朝右移動且超出畫布最右端，或朝左移動且超出畫布最左端，則將其從陣列中移除（消失不見）
    if ((ef.dir === 1 && ef.x - efDisplayWidth / 2 > width) ||
        (ef.dir === -1 && ef.x + efDisplayWidth / 2 < 0)) {
      effects.splice(i, 1);
    }
  }
}

// p5.js 內建事件函式：當鍵盤按鍵被按下的瞬間觸發一次
function keyPressed() {
  // 判斷是否按下「空白鍵」（key === ' ' 或 keyCode === 32），且目前沒有正在執行跳躍動作
  if ((key === ' ' || keyCode === 32) && !isJumping) {
    isJumping = true; // 開啟跳躍狀態
    jumpFrame = 0;    // 從第 0 張影格開始播放
  }
}

// 當瀏覽器視窗大小改變時自動觸發，讓全螢幕畫布隨時保持自適應
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}