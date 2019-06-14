document.addEventListener("DOMContentLoaded", function (event) {
    const container = document.querySelector('.container');
    const rect = container.getBoundingClientRect();


    let pressed = false;
    let mode = false;
    const moveLogic = function (x, y) {
        if (mode === true) {
            Ray = new Vec(x - Point.x, y - Point.y);
        }
        else {
            Point = new Vec(x, y);
        }
    }

    container.addEventListener("mousedown", (e) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        pressed = true;
        if (e.shiftKey)
            mode = true;
        else
            mode = false;

        moveLogic(x, y);
    });

    container.addEventListener("mouseup", (e) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        pressed = false;

        moveLogic(x, y);
    });

    container.addEventListener("mousemove", (e) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (pressed)
            moveLogic(x, y);
    });



    const canva = document.querySelector("#canva");
    /** @type {CanvasRenderingContext2D} */
    let ctx = canva.getContext("2d");
    // Draw(ctx, canva.width, canva.height);
    Init();
    setInterval(() => {
        Draw(ctx, canva.width, canva.height);
    }, 1000 / 30);
});


class Vec {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * 
     * @param {number} coef 
     */
    multiplyBy(coef) {
        return new Vec(this.x * coef, this.y * coef);
    }
    /**
     * 
     * @param {Vec} arg 
     */
    dot(arg) {
        return this.x * arg.x + this.y * arg.y;
    }
    /**
     * 
     * @param {Vec} arg 
     */
    cross_len(arg) {
        return this.x * arg.y - this.y * arg.x;
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    norm() {
        const len = this.len();
        return new Vec(this.x / len, this.y / len);
    }

    /**
     * 
     * @param {Vec} arg 
     */
    minus(arg) {
        return new Vec(this.x - arg.x, this.y - arg.y);
    }

    /**
     * 
     * @param {Vec} arg 
     */
    plus(arg) {
        return new Vec(this.x + arg.x, this.y + arg.y);
    }
}


class Line {
    /**
     * 
     * @param {Vec} a 
     * @param {Vec} b 
     */
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}


/**
 * 
 * @param {Vec} point 
 * @param {Vec} target 
 */
function distanceToPoint(point, target) {
    return point.minus(target).len();
}

/**
 * 
 * @param {Vec} point 
 * @param {Line} line 
 */
function distanceToLineImpl(point, line) {
    return Math.abs((line.b.y - line.a.y) * point.x - (line.b.x - line.a.x) * point.y + line.b.x * line.a.y - line.b.y * line.a.x) / Math.sqrt(Math.pow(line.b.y - line.a.y, 2) + Math.pow(line.b.x - line.a.x, 2));
}
/**
 * 
 * @param {Vec} point 
 * @param {Line} line 
 */
function distanceToLine(point, line) {
    let as = line.a;
    let bs = point;

    let ad = line.b.minus(line.a);
    let bd = new Vec(-ad.y, ad.x);

    let den = ad.x * bd.y - ad.y * bd.x;
    u = (as.y * bd.x + bd.y * bs.x - bs.y * bd.x - bd.y * as.x) / den;
    if (u >= 0 && u <= 1)
        return distanceToLineImpl(point, line);


    const dist1 = distanceToPoint(point, line.a);
    const dist2 = distanceToPoint(point, line.b);
    return Math.min(dist1, dist2);
}

let seed = 2;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function randInt(max) {
    return Math.floor(random() * Math.floor(max));
}

/** @type {Array<Line>} */
let Lines = [];
function Init() {
    const n = randInt(6) + 3;
    Lines = new Array(n).fill(new Line());
    Lines.forEach((value, index, ar) => {
        const a = new Vec(randInt(800), randInt(600));
        const b = new Vec(randInt(800), randInt(600));
        ar[index] = new Line(a, b);
    });
    const a = new Vec(0, 0);
    const b = new Vec(800, 0);
    const c = new Vec(800, 600);
    const d = new Vec(0, 600);
    Lines.push(new Line(a, b));
    Lines.push(new Line(b, c));
    Lines.push(new Line(c, d));
    Lines.push(new Line(d, a));
    console.log(Lines);
}

let Point = new Vec(50, 50);
let Ray = new Vec(8, 2);

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} w 
 * @param {number} h 
 */
const Draw = function (ctx, w, h) {
    // Clear
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    // Lines
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    Lines.forEach((line) => {
        ctx.moveTo(line.a.x, line.a.y);
        ctx.lineTo(line.b.x, line.b.y);
    });
    ctx.stroke();
    ctx.closePath();

    // Point
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.arc(Point.x, Point.y, 2, 0, 360);
    ctx.fill();
    ctx.closePath();

    let minRadius = 1e6;
    let iteration = 0;
    let nPoint = new Vec(Point.x, Point.y);
    while (minRadius > 1e-2) {
        minRadius = Lines.map((line) => {
            return distanceToLine(nPoint, line);
        }).reduce((min, r) => r < min ? r : min, 1e6);

        // Min Circle
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.arc(nPoint.x, nPoint.y, minRadius, 0, 360);
        ctx.stroke();
        ctx.closePath();

        // Ray
        const nRay = Ray.norm().multiplyBy(minRadius);
        ctx.beginPath();
        ctx.moveTo(nPoint.x, nPoint.y);
        ctx.lineTo(nPoint.x + nRay.x, nPoint.y + nRay.y);
        ctx.stroke();
        ctx.closePath();

        nPoint = nPoint.plus(nRay);
        if (iteration++ > 100)
            break;
    }


    // // All Cirlcle Test
    // ctx.beginPath();
    // ctx.strokeStyle = 'white';
    // Lines.forEach((line) => {
    //     const r = distanceToLine(Point, line);
    //     ctx.arc(Point.x, Point.y, r, 0, 360);
    // });
    // ctx.stroke();
    // ctx.closePath();
}

