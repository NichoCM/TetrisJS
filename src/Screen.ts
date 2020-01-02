
import p5 from 'p5';
import Board from './Board';
import Population from './Evolution';

export class Screen {

    private sk:p5;
    private board:Board;
    private population:Population;
    private intervalAmount = 0;
    private interval:any;

    public static keys = {
        W: false,
        A: false,
        D: false,
        S: false,
        cooldown: 0,
    }

    constructor(sk:p5) {
        this.sk = sk;
        this.population = new Population(50);
        this.board = new Board(this.population.next(), this.population.generation + '');
    }

    setup = () => {
        this.sk.createCanvas(1200, 1000);
        this.sk.fill(0)
        this.sk.noLoop(); // Allow us to manually handle redrawing
        this.interval = setInterval(this.draw, 0);
    }

    tick = 0;
    draw = () => {
        if(!this.board.step()) {
            this.board.draw(this.sk);
        } else {
            this.board = new Board(this.population.next(), this.population.generation + '');
        }
        this.drawInfo();
    }

    drawInfo() {
        this.sk.fill(0);
        this.sk.noStroke();
        this.sk.textSize(32);
        this.sk.text(`Score: ${this.board.score}`, 550, 400);
        this.sk.text(`Generation: ${this.population.generation}`, 550, 430);
        this.sk.text(`Index: ${this.population.currentIndex}`, 550, 460);
        this.sk.text(`Last population score: ${this.population.lastPopulationScore}`, 550, 490);
        this.sk.text(`Line clear weight: ${this.board.genome.lineWeight}`, 550, 550);
        this.sk.text(`Hole weight: ${this.board.genome.holeWeight}`, 550, 580);
        this.sk.text(`Height weight: ${this.board.genome.heightWeight}`, 550, 610);
        this.sk.text(`Bump weight: ${this.board.genome.bumpWeight}`, 550, 640);
    }

    keyPressed = () => {
        if(this.sk.keyCode == 65) {
            Screen.keys.A = true;
        }
        if(this.sk.keyCode == 68) {
            Screen.keys.D = true;
        }

        if(this.sk.keyCode == 87) {
            Screen.keys.W = true;
            this.intervalAmount += 10;
        }
        if(this.sk.keyCode == 83) {
            Screen.keys.S = true;
            this.intervalAmount -= 10;
        }

        if(this.intervalAmount < 0) {
            this.intervalAmount = 0;
        }
        
        clearInterval(this.interval);
        this.interval = setInterval(this.draw, this.intervalAmount);

    }

    keyReleased = () => {
        if(this.sk.keyCode == 65) {
            Screen.keys.A = false;
        }
        if(this.sk.keyCode == 68) {
            Screen.keys.D = false;
        }
        if(this.sk.keyCode == 87) {
            Screen.keys.W = false;
        }
        if(this.sk.keyCode == 83) {
            Screen.keys.S = false;
        }
    }

}

export default { 

    /**
     * Bind the screen p5 functions to the p5 instance.
     * 
     * @param sk the p5 instance which handles rendering
     */
    init: function(sk:p5) {
        let screen = new Screen(sk);
        sk.setup = screen.setup;
        sk.draw = screen.draw;
        sk.keyPressed = screen.keyPressed;
        sk.keyReleased = screen.keyReleased;
    }

}