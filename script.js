let Modal = document.getElementById("myModal");
let directionInput = document.getElementById("directionInput");
let forceInputModal = document.getElementById("forceInputModal");
let weightInput = document.getElementById("weightInput");
let width = window.innerWidth - 300;
let height = window.innerHeight;
let ground;
let leftWall;
let rightWall
let positionHistory = [];

let items = [];


function rangeReset() {
    let canvaswidth = document.getElementById("width");
    let canvasHeight = document.getElementById("height");
    directionInput.value = parseInt(directionInput.value) % 360;
    if (parseInt(weightInput.value) > 100) weightInput.value = 100;
    else if (parseInt(weightInput.value) < 1) weightInput.value = 1;

    if (parseInt(canvaswidth.value) < 100) canvaswidth.value = 100;
    if (parseInt(canvasHeight.value) < 100) canvasHeight.value = 100;
}


// 캔버스와 엔진을 연결합니다.
const canvas = document.getElementById('myCanvas');
// Matter.js 엔진을 초기화합니다.
const engine = Matter.Engine.create();
const world = engine.world;
let render = Matter.Render.create({
    element: document.body,
    canvas: canvas,
    engine: engine,
    options: {
        width: width,
        height: height,
    }
});
// 바닥을 생성합니다.
ground = Matter.Bodies.rectangle(width / 2, height + 25, width, 200, { isStatic: true });

// 왼쪽 벽을 생성합니다.
leftWall = Matter.Bodies.rectangle(-25, height / 2, 100, 10000, { isStatic: true });

// 오른쪽 벽을 생성합니다.
rightWall = Matter.Bodies.rectangle(width + 25, height / 2, 100, 10000, { isStatic: true });

// 물체를 생성합니다.
let circle = addObject(true);

const startId = circle.id;

// 마우스 제약 조건을 생성합니다.
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: Matter.Mouse.create(render.canvas),
    constraint: {
        stiffness: 0.2,
        render: {
            visible: true,
        },
        // 시뮬레이션이 정지되었을 때 드래깅을 허용하기 위한 조건부 논리 추가
        allowDrag: !simulationPaused,
    }
});
// 물체를 월드에 추가합니다.
Matter.World.add(world, [ground, leftWall, rightWall, circle, mouseConstraint]);

// 충돌 이벤트를 처리하기 위한 이벤트 리스너를 추가합니다.
Matter.Events.on(engine, 'collisionStart', function (event) {
    // 충돌한 두 물체를 가져옵니다.
    const pairs = event.pairs;

    // 각 충돌 쌍에 대해 처리합니다.
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];

        // 물체가 벽에 충돌한 경우
        if ((pair.bodyA === leftWall || pair.bodyA === rightWall) || (pair.bodyB === leftWall || pair.bodyB === rightWall)) {
            // 선택된 물체를 멈추도록 속도를 0으로 설정
            Matter.Body.setVelocity(selectedObject, { x: 0, y: 0 });
            Matter.Body.setPosition(selectedObject, selectedObject.position); // 현재 위치로 설정
        }
    }
});
// 애니메이션 루프를 설정합니다.
Matter.Engine.run(engine);
Matter.Render.run(render);
engine.world.gravity.y = 0.3;
// 물체의 속성을 수정할 때 사용할 변수
let selectedObject = null;

//오브젝트를 추가하는 함수.
function addObject(OBJTYPE=false) {
    let newObj;
    if (document.getElementById("objectType").value == 'c' || OBJTYPE != false) {
        // 물체를 생성합니다.
        newObj = Matter.Bodies.circle(width / 2, height / 2, 40);
    }
    else {
        newObj = Matter.Bodies.rectangle(width / 2, height / 2, 40, 40, { isStatic: false });
    }

    Matter.World.add(world, newObj);
    items.push(newObj);
    let select_object_id = document.getElementById("objectSetting_ID");
    let newOption = document.createElement('option');
    newOption.innerHTML = "id: " + newObj.id;
    newOption.value = newObj.id;
    select_object_id.append(newOption);
    return newObj;
}



// 오브젝트의 설정을 변경하는 함수
function objectSetting() {
    let idOf_select_object = document.getElementById("objectSetting_ID").value;
    selectedObject = items[idOf_select_object - startId];
    document.getElementById('myModal').style.visibility = 'visible';
    document.getElementById('myModalOverlay').style.visibility = 'visible';
    document.getElementById('item_id').innerHTML = 'id: ' + idOf_select_object;
    updateModalInputs();
}// 새로운 함수 추가: 선택한 요소를 계속해서 움직이도록 갱신
// 이동할 총 거리
const totalTranslation = 10;

// 선택된 요소를 계속해서 움직이기 위한 함수
function moveSelectedObject() {
    // 1. selectedObject가 null 또는 undefined이면 함수 종료
    if (!selectedObject) {
        return;
    }

    // 2. 초반 각도에서 해당 방향으로 계속 이동하도록 힘을 적용
    applyInitialForce();

    // 3. 다음 프레임에서 다시 함수를 호출
    requestAnimationFrame(moveSelectedObject);
}

// 선택된 요소를 움직이기 버튼 클릭 시 호출되는 함수에 추가
function checkSelectedObject() {
    let idOfSelectObject = document.getElementById("objectSetting_ID").value;
    selectedObject = items.find(item => item.id == idOfSelectObject);
    moveSelectedObject(); // 이 함수를 호출하여 선택된 요소를 계속해서 움직이도록 시작
}

// 선택된 요소의 초반 힘을 적용하는 함수
function applyInitialForce() {
    const initialForceMagnitude = parseFloat(document.getElementById('forceInputModal').value);
    const initialAngle = parseFloat(document.getElementById('directionInput').value);
    const initialAngleInRadians = (initialAngle * Math.PI) / 180;
    const initialForce = Matter.Vector.create(
        initialForceMagnitude * Math.cos(initialAngleInRadians),
        initialForceMagnitude * Math.sin(initialAngleInRadians)
    );

    // 초반 각도 방향으로 힘을 적용
    Matter.Body.applyForce(selectedObject, selectedObject.position, initialForce);
}


// 선택된 요소의 힘을 적용하는 함수
function applyForce() {
    const forceMagnitude = parseFloat(document.getElementById('forceInputModal').value);
    const angle = parseFloat(document.getElementById('directionInput').value);
    // 각도를 라디안으로 변환
    const angleInRadians = (angle * Math.PI) / 180;
    const force = Matter.Vector.create(forceMagnitude * Math.cos(angleInRadians), forceMagnitude * Math.sin(angleInRadians));
    // 선택된 요소에 힘을 적용
    Matter.Body.applyForce(selectedObject, selectedObject.position, force);
}

function updateModalInputs() {
    // 1. selectedObject가 null이면 함수 종료
    if (selectedObject === null || selectedObject === undefined) {
        return;
    }

    // 2. selectedObject.velocity가 정의되어 있는지 확인
    if (selectedObject.velocity !== undefined && selectedObject.velocity !== null) {
        const velocity = selectedObject.velocity;
        document.getElementById('directionInput').value = Matter.Vector.angle(velocity);
        document.getElementById('forceInputModal').value = Matter.Vector.magnitude(selectedObject.force) / selectedObject.mass;
        document.getElementById('weightInput').value = selectedObject.mass;
    } else {
        // selectedObject.velocity가 정의되어 있지 않을 경우에 대한 처리
        // 예: 기본값 사용 또는 다른 조치
    }
}


// 모달 창에서 입력된 값을 기반으로 물체의 속성을 업데이트하는 함수
function updateObjectProperties() {
    const direction = parseFloat(document.getElementById('directionInput').value);
    const forceMagnitude = parseFloat(document.getElementById('forceInputModal').value);
    const weight = parseFloat(document.getElementById('weightInput').value);

    if (selectedObject != null) {
        // 물체의 속성을 업데이트
        Matter.Body.setAngle(selectedObject, direction);
        Matter.Body.setMass(selectedObject, weight);

        // 새로운 힘 벡터를 계산하여 적용
        applyForce();
    }

    // 모달 창을 닫음
    document.getElementById('myModal').style.visibility = 'hidden';
    document.getElementById('myModalOverlay').style.visibility = 'hidden';
    console.log("업데이트 완료!");
}

function setWindow() {
    width = parseInt(document.getElementById("width").value);
    height = parseInt(document.getElementById("height").value);


    render = Matter.Render.create({
        element: document.body,
        canvas: canvas,
        options: {
            width: width,
            height: height,
        }
    });
    Matter.World.remove(world, [ground, leftWall, rightWall]);
    // 바닥을 생성합니다.
    ground = Matter.Bodies.rectangle(width / 2, height + 25, width, 100, { isStatic: true });

    // 왼쪽 벽을 생성합니다.
    leftWall = Matter.Bodies.rectangle(-25, height / 2, 100, 10000, { isStatic: true });

    // 오른쪽 벽을 생성합니다.
    rightWall = Matter.Bodies.rectangle(width + 25, height / 2, 100, 10000, { isStatic: true });

    Matter.World.add(world, [ground, leftWall, rightWall]);

    // 모달 창을 닫습니다.
    document.getElementById('windowModal').style.visibility = 'hidden';
    document.getElementById('myModalOverlay').style.visibility = 'hidden';
} function deleteObject() {
    // 선택된 요소의 ID를 가져옵니다.
    let selectedObjectId = document.getElementById("objectSetting_ID").value;
    getSelectedObject(selectedObjectId);
    // 선택된 요소의 DOM 요소를 찾습니다.
    let selectedObject = items.find(item => item.id == selectedObjectId);

    if (selectedObject) {
        // 선택된 요소를 월드에서 제거합니다.
        Matter.Composite.remove(world, selectedObject);

        // 선택된 요소를 배열에서 제거합니다.
        items = items.filter(item => item.id != selectedObjectId);

        // 선택된 요소를 해제합니다.
        selectedObject = null;

        // 선택된 요소 목록을 갱신합니다.
        updateObjectList();

        console.log("Object deleted successfully");
    } else {
        console.log("No selected object to delete");
    }
}



// 선택된 요소 목록을 갱신하는 함수
function updateObjectList() {
    let select_object_id = document.getElementById("objectSetting_ID");
    // 모든 옵션 제거
    select_object_id.innerHTML = "";

    // 새로운 옵션 추가
    items.forEach((item, index) => {
        let newOption = document.createElement('option');
        newOption.innerHTML = "id: " + item.id;
        newOption.value = item.id;
        select_object_id.append(newOption);
    });
}
// 모달 창에서 입력된 값을 기반으로 물체의 초반 힘을 업데이트하는 함수
function updateInitialForce() {
    const initialForceMagnitude = parseFloat(document.getElementById('forceInputModal').value);
    const initialAngle = parseFloat(document.getElementById('directionInput').value);
    const initialAngleInRadians = (initialAngle * Math.PI) / 180;
    const initialForce = Matter.Vector.create(
        initialForceMagnitude * Math.cos(initialAngleInRadians),
        initialForceMagnitude * Math.sin(initialAngleInRadians)
    );

    // 물체에 초반 힘을 적용
    Matter.Body.applyForce(selectedObject, selectedObject.position, initialForce);
}
// 선택된 요소를 초기 각도에서 계속 이동하도록 힘을 적용하는 함수
function applyInitialForce() {
    const initialForceMagnitude = parseFloat(document.getElementById('forceInputModal').value);
    const initialAngle = parseFloat(document.getElementById('directionInput').value);
    const initialAngleInRadians = (initialAngle * Math.PI) / 180;
    const initialForce = Matter.Vector.create(
        initialForceMagnitude * Math.cos(initialAngleInRadians),
        initialForceMagnitude * Math.sin(initialAngleInRadians)
    );

    // 초반 각도 방향으로 힘을 적용
    Matter.Body.applyForce(selectedObject, selectedObject.position, initialForce);
}
var simulationPaused = false;
// 초기 속도를 저장할 객체
var initialVelocities = {};
function togglePauseResume(event) {
    // 여기서 event 객체가 정의되어 있는지 확인
    if (event) {
        // 이벤트 전파 방지
        event.stopPropagation();

        // 나머지 코드...
    } else {
        console.error("Event object is undefined.");
    }

    if (simulationPaused) {
        resumeSimulation();
    } else {
        pauseSimulation();
    }

    simulationPaused = !simulationPaused;
}

// 시뮬레이션을 일시정지하는 함수
function pauseSimulation() {
    // 시뮬레이션을 일시정지합니다.
    Matter.Composite.allBodies(world).forEach(function(body) {
        if (body !== ground && body !== leftWall && body !== rightWall) {
            // 바닥과 벽이 아닌 경우에만 속도를 초기화하고 정지 상태로 만듦
            initialVelocities[body.id] = body.velocity;
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            body.isStatic = false;
            body.isSensor = true; // 마우스와 상호작용 가능하도록 설정
        }
    });

    console.log("Simulation paused");
}

// 시뮬레이션을 재개하는 함수
function resumeSimulation() {
    // 시뮬레이션을 재개합니다.
    Matter.Composite.allBodies(world).forEach(function(body) {
        if (body !== ground && body !== leftWall && body !== rightWall) {
            // 바닥과 벽이 아닌 경우에만 저장된 초기 속도를 적용하고 정지 상태를 해제함
            Matter.Body.setVelocity(body, initialVelocities[body.id]);
            body.isStatic = false;
            body.isSensor = false; // 다시 마우스와 상호작용 불가능하도록 설정
        }
    });

    console.log("Simulation resumed");
}

document.addEventListener('DOMContentLoaded', function() {
    // 여기에 코드 추가
    let isPaused = false;

    document.getElementById('pauseButton').addEventListener('click', function() {
        isPaused = !isPaused;
        if (isPaused) {
            // 시뮬레이션이 일시정지된 상태에서 마우스로 이동 가능하도록 설정
            Matter.Events.on(engine, 'beforeUpdate', function() {
                Matter.Body.setPosition(movableObject, { x: mouseX, y: mouseY });
            });
        } else {
            // 일시정지가 해제되면 이벤트 제거
            Matter.Events.off(engine, 'beforeUpdate');
        }
    });

    let mouseX, mouseY;
    document.getElementById('movableObject').addEventListener('mousemove', function(event) {
        if (isPaused) {
            // 마우스 위치 저장
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    });
});
function togglePauseResume(event) {
    // 여기서 event 객체가 정의되어 있는지 확인
    if (event) {
        // 이벤트 전파 방지
        event.stopPropagation();

        // 나머지 코드...
    } else {
        console.error("Event object is undefined.");
    }

    if (simulationPaused) {
        resumeSimulation();
    } else {
        pauseSimulation();
    }

    simulationPaused = !simulationPaused;
}

// 시뮬레이션을 일시정지하는 함수
function pauseSimulation() {
    // 시뮬레이션을 일시정지합니다.
    Matter.Composite.allBodies(world).forEach(function(body) {
        if (body !== ground && body !== leftWall && body !== rightWall) {
            // 바닥과 벽이 아닌 경우에만 속도를 초기화하고 정지 상태로 만듦
            initialVelocities[body.id] = body.velocity;
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            body.isStatic = true;
            body.isSensor = true; // 마우스와 상호작용 가능하도록 설정
        }
    });

    console.log("Simulation paused");
}

// 시뮬레이션을 재개하는 함수
function resumeSimulation() {
    // 시뮬레이션을 재개합니다.
    Matter.Composite.allBodies(world).forEach(function(body) {
        if (body !== ground && body !== leftWall && body !== rightWall) {
            // 바닥과 벽이 아닌 경우에만 저장된 초기 속도를 적용하고 정지 상태를 해제함
            Matter.Body.setVelocity(body, initialVelocities[body.id]);
            body.isStatic = false;
            body.isSensor = false; // 다시 마우스와 상호작용 불가능하도록 설정
        }
    });

    console.log("Simulation resumed");
}
var velocityDisplayActive = false;

// 다음 함수는 수정된 코드에 추가된 부분입니다.
function getSelectedObject() {
    return selectedObject; // 여기에 선택된 물체를 반환하는 코드를 추가하세요.
}
// 수정된 코드: 물체 속도 표시 부분
function toggleVelocityDisplay() {
    velocityDisplayActive = !velocityDisplayActive;
    resetPositionHistory()
    if (velocityDisplayActive) {
        document.getElementById('toggleVelocityDisplayButton').innerText = '물체 속도 표시 중지';
        displayVelocityOfSelectedObject();
    } else {
        document.getElementById('toggleVelocityDisplayButton').innerText = '물체 속도 표시 시작';
        hideVelocityDisplay();
    }
}

function displayVelocityOfSelectedObject() {
    var selectedObject = getSelectedObject();

    if (selectedObject) {
        // 현재 물체의 속도를 물체 위에 텍스트로 표시
        showVelocityOnObject(selectedObject);
    } else {
        alert('물체를 선택하세요.');
        document.getElementById('toggleVelocityDisplayButton').innerText = '물체 속도 표시 시작';
    }
}

// 다음 함수는 수정된 코드에 추가된 부분입니다.
function showVelocityOnObject(object) {
    // 텍스트 엘리먼트를 만들거나 가져오기
    var textElement = document.querySelector('.velocity-display');
    if (!textElement) {
        textElement = document.createElement('div');
        textElement.className = 'velocity-display'; // 클래스 추가
        textElement.style.position = 'absolute';
        document.body.appendChild(textElement);
    }

    // 매번 물체의 위치 및 속도 가져오기
    var position = object.position;
    var velocity = object.velocity;
    document.getElementById("speed").innerHTML=Math.round(Math.sqrt((velocity.x.toFixed(2))*(velocity.x.toFixed(2))+(velocity.y.toFixed(2))*(velocity.y.toFixed(2)))*10)/10
    // 현재 위치를 위치 이력에 추가합니다
    positionHistory.push({ x: position.x, y: position.y });

    // 차트를 위치 이력으로 업데이트합니다
    updateChart();

    // 속도 표시 갱신 (애니메이션 프레임에 따라)
    requestAnimationFrame(function () {
        if (velocityDisplayActive) {
            showVelocityOnObject(object);
        } else {
            textElement.remove();
        }
    });
}

// 이벤트 핸들러 추가: 물체를 선택할 때 속도 표시 갱신
document.getElementById('objectSetting_ID').addEventListener('change', function () {
    if (velocityDisplayActive) {
        displayVelocityOfSelectedObject();
    }
});


document.getElementById('toggleVelocityDisplayButton').addEventListener('click', toggleVelocityDisplay);

// 차트를 업데이트하는 새로운 함수를 추가하세요
function updateChart() {
    const canvas = document.getElementById('velocityChart');
    const ctx = canvas.getContext('2d');

    // 캔버스를 지웁니다
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 차트에 위치 이력을 플로팅합니다
    if (positionHistory.length > 0) {
        ctx.beginPath();
        ctx.moveTo(positionHistory[0].x, positionHistory[0].y);
        for (const position of positionHistory) {
            ctx.lineTo(position.x, position.y);
        }
        ctx.stroke();
    }
}


// 시뮬레이션이 시작되거나 차트를 재설정하려면 이 함수를 호출하세요
function resetPositionHistory() {
    positionHistory = [];
    updateChart();
}

function exportChartImage() {
    const canvas = document.getElementById('velocityChart');
    const link = document.createElement('a');

    // 캔버스 내용을 데이터 URL로 변환합니다
    const dataUrl = canvas.toDataURL();

    // 링크의 href 속성을 데이터 URL로 설정합니다
    link.href = dataUrl;

    // 링크의 download 속성을 사용하여 파일 이름을 지정합니다
    link.download = 'chart.png';

    // 링크를 문서에 추가합니다
    document.body.appendChild(link);

    // 다운로드를 시작하기 위해 링크를 클릭합니다
    link.click();

    // 링크를 문서에서 제거합니다
    document.body.removeChild(link);
}
