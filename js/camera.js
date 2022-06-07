'use strict';

(function(exports) {
  const WHICH_CAMERA = 0; // 0 is back camera and 1 is front camera.

  var CameraTest = {

    init: function() {
      this._cameras = null;
      this._cameraObj = null;
      this.viewfinder = document.getElementById('viewfinder');
      this.message = document.getElementById('message');

      if (!navigator.mozCameras) {
        this.message.innerHTML = 'mozCameras does not exist';
        return;
      }

      this.setSource();
      this.qr = new QrcodeDecoder();
    },

    setSource: function() {
      this.viewfinder.mozSrcObject = null;
      this._cameras = navigator.mozCameras.getListOfCameras();
      navigator.mozCameras.getCamera(this._cameras[WHICH_CAMERA])
        .then(
          this.gotCamera.bind(this),
          this.gotCameraError.bind(this)
        );
    },

    gotCamera: function(params) {
      let camera = this._cameraObj = params.camera;
      let config = {
        pictureSize: this.getProperPictureSize(camera.capabilities.pictureSizes)
      };
      camera.setConfiguration(config);

      let transform = '';
      var style = this.viewfinder.style;
      let angle = camera.sensorAngle;
      transform += 'rotate(' + angle + 'deg)';

      style.MozTransform = transform;

      var width = document.body.clientWidth;
      var height = document.body.clientHeight;
      if (angle % 180 === 0) {
        style.top = 0;
        style.left = 0;
        style.width = width + 'px';
        style.height = height + 'px';
      } else {
        style.top = ((height / 2) - (width / 2)) + 'px';
        style.left = -((height / 2) - (width / 2)) + 'px';
        style.width = height + 'px';
        style.height = width + 'px';
      }

      this.viewfinder.mozSrcObject = camera;
      this.viewfinder.play();

      this.decodeFromVideo();
    },

    decodeFromVideo: function () {
      this.qr.decodeFromVideo(this.viewfinder).then(
        res => {
          alert(res.data);
          this.decodeFromVideo();
        }, err => {
          alert(err);
        });
    },

    gotCameraError: function() {
      // some log or do some thing
    },

    getProperPictureSize: function (sizes) {
      let delta, ratio, gradual = 1, index = 0;
      let screenRatio = document.body.clientWidth/ document.body.clientHeight;

      // get a picture size that's the largest and mostly eaqual to screen ratio
      for (let i = 0, len = sizes.length; i < len; i++) {
        ratio = sizes[i].height / sizes[i].width;
        if (ratio > 1) {
          ratio = 1 / ratio;
        }
        delta = Math.abs(screenRatio - ratio);
        if (delta < gradual || (delta === gradual &&
          sizes[index].height * sizes[index].width < sizes[i].height * sizes[i].width)) {
          gradual = delta;
          index = i;
        }
      }
      return sizes[index];
    },

    visibilityChange: function() {
      if (document.mozHidden) {
        this.stopPreview();
        this.qr.stop();
      } else {
        this.startPreview();
      }

      if (this._cameraObj) {
        this._cameraObj.release().then(function() {
          self._cameraObj = null;
        }, function() {
          console('fail to release camera');
        });
      }
  },

    startPreview: function() {
      this.viewfinder.play();
      this.setSource();
    },

    stopPreview: function() {
      this.viewfinder.pause();
      this.viewfinder.mozSrcObject = null;
      this.qr = null;
    },

    deInit: function() {
      this.stopPreview();

      if (this._cameraObj) {
        this._cameraObj.release().then(() => {
          this._cameraObj = null;
        }, function() {
          console('fail to release camera');
        });
      }
    }

  };

  exports.CameraTest = CameraTest;
}(window));
