const box = document.getElementById('box');
  let isDragging = false;
  let offsetX, offsetY;
  let isGravityEnabled = true;
  const gravity = 0.5;
  let velocityY = 0;
  let positionY = 0;

  const gravityButton = document.getElementById('gravityButton');

  gravityButton.addEventListener('click', () => {
    isGravityEnabled = !isGravityEnabled;
  });

  box.addEventListener('mousedown', (e) => {
    isDragging = true;
    const boxRect = box.getBoundingClientRect();
    offsetX = e.clientX - boxRect.left;
    offsetY = e.clientY - boxRect.top;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      box.style.left = x + 'px';
      box.style.top = y + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    const boxRect = box.getBoundingClientRect();
    positionY = boxRect.top; // 드래그가 끝났을 때 해당 위치의 초기 높이로 설정
    velocityY = 0; // 드래그가 끝났을 때 초기 속도를 0으로 설정
  });

  function update() {
    if (isGravityEnabled && !isDragging) {
      velocityY += gravity;
      positionY += velocityY;
      if (positionY > window.innerHeight - box.clientHeight) {
        positionY = window.innerHeight - box.clientHeight;
        velocityY = 0; // 바닥에 도달하면 속도를 0으로 설정하여 멈춤
      }
      box.style.top = positionY + 'px';
    }
    requestAnimationFrame(update);
  }

  update();