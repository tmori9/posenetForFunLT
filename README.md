# posenetForFunLT
2019/05/18に行われた [未来大×企業エンジニア 春のLT大会](https://fun.connpass.com/event/127784/) で使用したPoseNetのデモ

## Description
### PoseNet
Pose Detection in the Browser
* [GitHub](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
* [公式デモ](https://storage.googleapis.com/tfjs-models/demos/posenet/camera.html)
* [ブログ (Medium)](https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5)

### Difference from Official Demo
* PoseNetの公式のデモからUIやMulti-Person Pose Estimation機能を省いた
* LTの終了画面をシャッターでおろせるようにした（？）

## Demo
![demo](https://github.com/YutoMori/posenetForFunLT/blob/master/posenetDemo.gif)

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

## LICENCE
[Apache License2.0](https://github.com/YutoMori/posenetForFunLT/blob/master/LICENSE)


Copyright 2018 Google Inc. All Rights Reserved.
