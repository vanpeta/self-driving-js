const canvas = document.getElementById("myCanvas");
canvas.width = 600;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width / 3 * 0.9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
];


annimate();

function annimate() {
    traffic.forEach(car => {
        car.update(road.borders, []);
    });
    car.update(road.borders, traffic);
    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);

    road.draw(ctx);
    traffic.forEach(car => {
        car.draw(ctx, true);
    })
    car.draw(ctx, false);

    ctx.restore();
    requestAnimationFrame(annimate);
}