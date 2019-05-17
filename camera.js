/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *
 * This program was changed by Yuto Mori.
 * change: please refer to "Difference from Demo" in READEME.md
 *
 */

const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = false;
const videoWidth = 900;
const videoHeight = 700;
const color = "aqua";
const lineWidth = 2;

let endMode = false;
let allEnd = false;
let limitEnd = 0;

let imageScale = 1;
const imageFace = new Image();
imageFace.src = "face.png";
const imageEnding = new Image();
imageEnding.src = "ending.png";

// カメラのセットアップ
async function setupCamera() {
  const video = document.getElementById("video");
  video.width = videoWidth;
  video.height = videoHeight;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: videoWidth,
        height: videoHeight
      }
    });
    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  } else {
    const errorMessage =
      "This browser does not support video capture, or this device does not have a camera";
    alert(errorMessage);
    return Promise.reject(errorMessage);
  }
}

// ビデオの起動
async function loadVideo() {
  const video = await setupCamera();
  video.play();
  return video;
}

// 姿勢予測
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  const flipHorizontal = true;
  // since images are being fed from a webcam

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    let poses = [];
    let minPoseConfidence = 0.1; // if single pose detection
    let minPartConfidence = 0.5;

    const pose = await net.estimateSinglePose(
      video,
      imageScaleFactor,
      flipHorizontal,
      outputStride
    );
    // 複数人での認識はここを修正する
    poses.push(pose);

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    poses.forEach(({ score, keypoints }) => {
      drawFace(keypoints[0], keypoints[1], ctx);
      //console.log("leftSholder: ",keypoints[5].position.y)
      //console.log("leftElbow: ",keypoints[7].position.y)

      rightFlag = raiseHand(keypoints[5], keypoints[7], keypoints[9]);
      leftFlag = raiseHand(keypoints[6], keypoints[8], keypoints[10]);
      if(leftFlag&&rightFlag){
        if(firstFlag){
          startTime = new Date();
          firstFlag = false;
        }
        endTime = new Date();
        s_delta = (endTime.getTime() - startTime.getTime())/1000;
        console.log("両手をあげてます: ", s_delta)
        if(s_delta > 2){
          endMode = true; // 終了画面
        }
      } else {
        startTime = null;
        firstFlag = true;
        if(leftFlag){
          console.log("左手あげてます")
        } else if(rightFlag) {
          console.log("右手上げてます")
        }
      }

      if(endMode){
        endShutter(keypoints[10], keypoints[9], ctx);
      }

      if (score >= minPoseConfidence) {
        drawKeypoints(keypoints, minPartConfidence, ctx);
        drawSkeleton(keypoints, minPartConfidence, ctx);
      }
    });

    requestAnimationFrame(poseDetectionFrame);
  }
  poseDetectionFrame();
}

// Posenetのモデルを読み込んでカメラを開始する
async function bindPage() {
  const net = await posenet.load(1.0); // posenetの呼び出し

  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "block";
  let video;
  try {
    video = await loadVideo(); // video属性をロード
  } catch (e) {
    console.error(e);
    return;
  }
  detectPoseInRealTime(video, net);
}


// ----tfjs-models/posenet/demos/demo_util.js----
function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}

function toTuple({y, x}) {
  return [y, x];
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints =
      posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
        toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
  });
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 顔に写真を貼り付ける
function drawFace(nose, leye, ctx) {
  imageScale = (leye.position.x - nose.position.x - 50) / 50;
  if (imageScale < 2.0) imageScale = 2.0;
  console.log(imageScale)
  let nw = imageFace.width * imageScale;
  let nh = imageFace.height * imageScale;
  ctx.drawImage(
    imageFace,
    nose.position.x - nh / 2,
    nose.position.y - nh / 2,
    nw,
    nh
  );
}

// 挙手判定
function raiseHand(Shoulder, Elbow, Wrist) {
  if((Shoulder.position.y > Elbow.position.y)&&(Elbow.position.y > Wrist.position.y)){
    return true
  }else{
    return false
  }
}

// 終わりシャッター
function endShutter(leftWrist, rightWrist, ctx) {
  if(leftWrist.position.y < rightWrist.position.y){
    shutter_y = leftWrist.position.y - videoHeight;
  }else{
    shutter_y = rightWrist.position.y - videoHeight;
  }
  
  if(shutter_y > -50){
    limitEnd += 1;
  }
  //console.log(shutter_y);
  //console.log("limitEnd: ", limitEnd);
  if (limitEnd > 10){
    ctx.drawImage(
      imageEnding,
      5,
      0,
      videoWidth,
      videoHeight
    );
  }else{
    ctx.drawImage(
      imageEnding,
      5,
      shutter_y,
      videoWidth,
      videoHeight
      );
    }
  }
  

bindPage();
