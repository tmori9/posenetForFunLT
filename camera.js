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
 * TODO: change things
 *
 */

const imageScaleFactor = 0.2;
const outputStride = 16;
const flipHorizontal = false;
const videoWidth = 900;
const videoHeight = 700;
const color = "aqua";

let imageScale = 1;
let imageFace = new Image();
imageFace.src = "image.png";

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
      if (score >= minPoseConfidence) {
        drawKeypoints(keypoints, minPartConfidence, ctx);
      }
    });

    requestAnimationFrame(poseDetectionFrame);
  }
  poseDetectionFrame();
}

// Posenetのモデルを読み込んでカメラを開始する
async function bindPage() {
  const net = await posenet.load(); // posenetの呼び出し

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

// 顔に写真を貼り付ける
function drawFace(nose, leye, ctx) {
  imageScale = (leye.position.x - nose.position.x - 50) / 50;
  if (imageScale < 0.7) imageScale = 0.7;
  let nw = imageFace.width * imageScale;
  let nh = imageFace.height * imageScale;
  ctx.drawImage(
    imageFace,
    nose.position.x - nh / 2,
    nose.position.y - nh / 1.5,
    nw,
    nh
  );
}

bindPage();
