'use strict';

window.addEventListener('load', () => {
  CameraTest.init();
});

window.addEventListener('beforeunload', () => {
  CameraTest.deInit();
});
