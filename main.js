let carCanvas, networkCanvas, carCtx, networkCtx, road, cars, bestCar, traffic, driver, N, mutationRate, trafficLevel;
const controlsDiv = document.getElementById("controls");
const graffics = document.getElementById("graffics");
const aiSettings = document.getElementById("ai-settings");
graffics.style.display = 'none';
aiSettings.style.display = 'none';
let isShowCanvas = false;
function toggleCanvas() {
    isShowCanvas = !isShowCanvas;
    if(!isShowCanvas) {
        graffics.style.display = 'none';
    } else {
        graffics.style.display = 'block';
    }
}

function showAISettings() {
    aiSettings.style.display = 'block';
}

function setDriver(selectedDriver) {
    driver = selectedDriver;
    switch (driver) {
        case "KEYS":
            N = 1;
            setTrafficLevel(5);
            toggleCanvas();
            start();
            break;
        case "AI":
            showAISettings();
            break;
    }
}

function generateTraffic(level) {
    traffic = [
        new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -1100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -1900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -2100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -2100, 30, 50, "DUMMY", 2)
    ];
    switch(level) {
        case 0:
            traffic.splice(0);
            break;
        case 1:
            traffic.splice(1);
            break;
        case 2:
            traffic.splice(3);
            break;
        case 3:
            traffic.splice(5);
            break;
        case 4:
            traffic.splice(7);
            break;
        case 5:
            break;
    }
}

function setTrafficLevel(level) {
    trafficLevel = level;
}

function setAI() {
    N = document.getElementById("number-of-AIs").value || 1;
    mutationRate = document.getElementById("mutation-rate").value * 0.01;
    toggleCanvas();
    start();
}

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function start() {
    if (isShowCanvas) {
        carCanvas = document.getElementById("carCanvas");
        carCanvas.width = 200;

        networkCanvas = document.getElementById("networkCanvas");
        networkCanvas.width = 300;

        carCtx = carCanvas.getContext("2d");
        networkCtx = networkCanvas.getContext("2d");

        road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
        generateTraffic(trafficLevel)

        cars = generateCars(N);

        bestCar = cars[0];
        if(localStorage.getItem("bestBrain")) {
            cars.forEach((car, i) => {
                car.brain = JSON.parse(localStorage.getItem("bestBrain"));
                if(i != 0) {
                    NeuralNetwork.mutate(cars[i].brain, mutationRate);
                }
            });
            bestCar.brain = JSON.parse(localStorage.getItem("bestBrain"));
        }
        
        annimate();
    }
}

function generateCars(N) {
    const cars = [];
    for(let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, driver));
    }
    return cars;
}

function annimate(time) {
    traffic.forEach(car => {
        car.update(road.borders, []);
    });
    cars.forEach(car => {
        car.update(road.borders, traffic);
    });

    bestCar = cars.find(car =>
        car.y == Math.min(...cars.map(c => c.y))
    );

    carCanvas.height = window.innerHeight - controlsDiv.offsetHeight;
    networkCanvas.height = window.innerHeight - controlsDiv.offsetHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    traffic.forEach(car => {
        car.draw(carCtx, true);
    });

    carCtx.globalAlpha = 0.2;
    cars.forEach(car => {
        car.draw(carCtx, false);
    });
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, false, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(annimate);
}