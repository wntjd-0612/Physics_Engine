import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Matter.js 엔진 생성
    const engine = Matter.Engine.create();
    const world = engine.world;

    // Canvas 엘리먼트 가져오기
    const canvas = canvasRef.current;

    // 물체의 현재 속도를 저장할 변수 추가
    let currentVelocity = { x: 0, y: 0 };

    // 바디 생성 (원으로 변경)
    const circle = Matter.Bodies.circle(400, 200, 40, {
      restitution: 0.8, // 튕김 계수
      render: {
        fillStyle: 'red', // 빨간색으로 설정
      },
    });

    const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

    // 벽 생성 (파란색으로 변경)
    const wall = Matter.Bodies.rectangle(700, 400, 20, 200, {
      isStatic: true,
      render: {
        fillStyle: 'blue', // 파란색으로 설정
      },
    });

    // 바디를 월드에 추가
    Matter.World.add(world, [circle, ground, wall]);

    // 렌더러 생성
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false, // 와이어프레임 비활성화
      },
    });

    // 마우스 제어 추가
    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    // 마우스 이벤트를 렌더러에 추가
    Matter.World.add(world, mouseConstraint);

    // 충돌 이벤트 추가
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      pairs.forEach((pair) => {
        // 충돌할 때 현재 속도를 반대 방향으로 반전
        if (pair.bodyA === circle && pair.bodyB === wall) {
          currentVelocity = { x: -currentVelocity.x, y: -currentVelocity.y };
        } else if (pair.bodyA === wall && pair.bodyB === circle) {
          currentVelocity = { x: -currentVelocity.x, y: -currentVelocity.y };
        }
      });
    });

    // 충돌 중인 이벤트 추가
    Matter.Events.on(engine, 'collisionActive', (event) => {
      const pairs = event.pairs;

      pairs.forEach((pair) => {
        // 속도를 현재 속도로 설정하여 관성의 법칙을 적용
        if (pair.bodyA === circle && pair.bodyB === wall) {
          Matter.Body.setVelocity(circle, currentVelocity);
        } else if (pair.bodyA === wall && pair.bodyB === circle) {
          Matter.Body.setVelocity(circle, currentVelocity);
        }
      });
    });

    // 엔진 업데이트 함수 추가
    Matter.Events.on(engine, 'afterUpdate', () => {
      // 물체의 현재 속도를 업데이트
      currentVelocity = circle.velocity;
    });

    // 렌더러 업데이트
    Matter.Render.run(render);

    // 엔진 업데이트
    Matter.Engine.run(engine);

    // 컴포넌트가 언마운트되면 엔진을 정리합니다.
    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div className="App">
      <h1>물리 시뮬레이션</h1>
      <p>This is a use Matter.js and React.</p>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
