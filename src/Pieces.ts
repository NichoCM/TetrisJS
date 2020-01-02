import Drawable from "./Drawable";
import p5 from "p5";
import { TileColors } from "./Colors";
import { clone2D } from "./Util";

const Shapes = {
    I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
	J: [[2,0,0], [2,2,2], [0,0,0]],
	L: [[0,0,3], [3,3,3], [0,0,0]],
	O: [[4,4], [4,4]],
	S: [[0,5,5], [5,5,0], [0,0,0]],
	T: [[0,6,0], [6,6,6], [0,0,0]],
	Z: [[7,7,0], [0,7,7], [0,0,0]]
}

/**
 * Mimics the rotation of a tetris piece
 */
function transpose(array:number[][]) {
   return array[0].map((_, c) => array.map(r => r[c]));
}

function shuffleArray(array:any[], rand:any) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default class Piece implements Drawable {

    private defaultShape: number[][];
    private shape: number[][];
    
    // Positions
    protected x: number = 0;
    protected y: number = 0;
    protected r: number = 0;

    public outline = false;

    constructor(shape:number[][]) {
        this.defaultShape = clone2D(shape)
        this.shape = clone2D(shape);
    }

    /**
     * Draw this piece at the specified position
     * @override
     * @param sk
     */
    public draw(sk: p5): void {
        for(var y = 0; y < this.shape.length; y++) {
            for(var x = 0; x < this.shape[0].length; x++) {
                if(this.shape[y][x]) {
                    this.drawTile(sk, x, y, 50, TileColors[this.shape[y][x]]);
                }
            }
        }
    }

    /**
     * Draw the current tile
     */
    private drawTile(sk:p5, x: number, y: number, dim: number, hex:string) {
        if(this.outline) {
            sk.stroke(sk.color(hex));
            sk.strokeWeight(4);
            sk.noFill();
        } else {
            sk.stroke(255);
            sk.strokeWeight(1);
            sk.fill(sk.color(hex));
        }
        sk.rect((this.x + x) * dim, (this.y + y) * dim, dim, dim);
    }

    /**
     * Reset the piece to the default state
     */
    public reset() {
        this.setPos(Math.floor((10 - this.shape.length) / 2), 0);
        this.shape = clone2D(this.shape);
    }

    /**
     * Set the x/y pos to the waiting pos
     */
    setWaitingPos() {
        this.setPos(12, 5);
    }

    /**
     * Set the position of the piece
     */
    setPos(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Rotate the piece (counter clockwise)
     */
    rotateLeft(grid:number[][]): boolean {
        let original = clone2D(this.shape);

        // Perform the rotation
        this.rotate();

        // If it collides, try to move the piece out of the way
        if(this.isColliding(grid))  {
            if(!this.move(grid, -1) && !this.move(grid, 1)) {
                // Undo the rotate, it won't fit
                this.shape = original;
                return false;
            }
        }
        return true;
    }

    /**
     * Rotate the piece (counter clockwise)
     */
    rotateRight(grid:number[][]): boolean {
        let original = clone2D(this.shape);

        // Perform the rotation
        this.rotate(3);

        // If it collides, try to move the piece out of the way
        if(this.isColliding(grid))  {
            if(!this.move(grid, -1) && !this.move(grid, 1)) {
                // Undo the rotate, it won't fit
                this.shape = original;
                return false;
            }
        }
        return true;
    }

    /**
     * Perform the rotation (counter clockwise)
     * @param amount 
     */
    rotate(amount:number = 1) {
        for(var r = 0; r < amount; r++) {
            this.shape = transpose(this.shape);
            for (var i = 0; i < this.shape.length; i++) {
                this.shape[i].reverse();
            }
            this.r = (this.r + 1 % 4);
        }
    }

    drop(grid:number[][]) : boolean {
        this.y += 1;
        if(this.isColliding(grid)) {
            this.y -= 1;
            return false;
        }
        return true;
    }

    move(grid:number[][], dx: number): boolean {
        this.x += dx;
        if(this.isColliding(grid)) {
            this.x -= dx;
            return false;
        }
        return true;
    }

    isColliding(grid:number[][]) {
        for(var y = 0; y < this.shape.length; y++) {
            for(var x = 0; x < this.shape[0].length; x++) {
                if(this.shape[y][x] && (grid[this.y + y] === undefined || grid[this.y + y][this.x + x] == undefined || grid[this.y + y][this.x + x])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get the shape array
     */
    getShape() {
        return clone2D(this.shape);
    }

    /**
     * Get the x position
     */
    getX() {
        return this.x;
    }

    /**
     * Get the y position
     */
    getY() {
        return this.y;
    }

    /**
     * Get the y position
     */
    getR() {
        return this.r;
    }

    getOriginal(): Piece {
        return new Piece(this.defaultShape);
    }

}

export class PieceI extends Piece {

    constructor() {
        super(Shapes.I);
    } 

    /**
     * Reset the piece to the default state
     */
    public reset() {
        super.reset();
        this.y = -1;
    }

}

export class PieceJ extends Piece {

    constructor() {
        super(Shapes.J);
    } 

}

export class PieceL extends Piece {

    constructor() {
        super(Shapes.L);
    } 

}

export class PieceO extends Piece {

    constructor() {
        super(Shapes.O);
    } 

}

export class PieceS extends Piece {

    constructor() {
        super(Shapes.S);
    } 

}

export class PieceT extends Piece {

    constructor() {
        super(Shapes.T);
    } 

}

export class PieceZ extends Piece {

    constructor() {
        super(Shapes.Z);
    } 

}

export function randomBag(rand:any): Piece[] {
    let pieces = [new PieceI(), new PieceJ(), new PieceL(), new PieceO(), new PieceS(), new PieceT(), new PieceZ()];
    shuffleArray(pieces, rand);
    return pieces;
}

