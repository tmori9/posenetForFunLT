# posenetForFunLT

2019/05/18 に行われた [未来大 × 企業エンジニア 春の LT 大会](https://fun.connpass.com/event/127784/) で使用した PoseNet のデモ

GitHub Pages → https://tmori9.github.io/posenetForFunLT/

## Description

### PoseNet

Pose Detection in the Browser

- [GitHub](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
- [公式デモ](https://storage.googleapis.com/tfjs-models/demos/posenet/camera.html)
- [ブログ (Medium)](https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5)

### Difference from Official Demo

- PoseNet の公式のデモから UI や Multi-Person Pose Estimation 機能を省いた
- LT の終了画面をシャッターでおろせるようにした（？）

## Demo

![demo](https://github.com/YutoMori/posenetForFunLT/blob/master/posenetDemo.gif)

## Slide

LT で使用した [プレゼンテーションスライド](https://www.slideshare.net/YutoMori2/pc-posenet)

## Install

```
$ git clone git@github.com:YutoMori/posenetForFunLT.git
$ cd posenetForFunLT

# Windows
$ start index.html

# macOS
$ open index.html

# Unix
$ chrome index.html
```

要するにダウンロードしてブラウザで起動

## Q&A

### パフォーマンスや精度を上げたい（or スペック不足により下げたい）場合

下記の変数の数値を変更してください

- multiplier
- imageScaleFactor
- outputStride

```
# 使用されている箇所 (camera.js)

const net = await posenet.load(multiplier);
const pose = await net.estimateSinglePose(
    image, imageScaleFactor, flipHorizontal, outputStride
    );
```

調整方法は [公式の README](https://github.com/tensorflow/tfjs-models/tree/master/posenet) を参照してください

## LICENCE

[Apache License2.0](https://github.com/YutoMori/posenetForFunLT/blob/master/LICENSE)
