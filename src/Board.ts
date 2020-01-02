import Drawable from "./Drawable";
import p5 from 'p5';
import Piece, { randomBag } from "./Pieces";
import { TileColors } from "./Colors";
var seedrandom = require('seedrandom');

import Pathfinding, { Position } from './Pathfinding';
import { clone2D } from "./Util";
import { Genome } from "./Evolution";

export default class Board implements Drawable {

    private static Width = 10;
    private static Height = 20;

    private grid: number[][];

    private piece:Piece;
    private bag:Piece[];
    private stepIndex = 1;
    public score = 0;
    private gameOver = false;
    private rand:any;

    // AI controller stuff
    genome:Genome;
    path: Position[];
    goal: Position;
    goalPiece: Piece;

    constructor(genome:Genome, seed:string) {
        this.rand = seedrandom(seed);
        this.grid = Board.generateBoard();
        this.genome = genome;

        // Initialize the pieces
        this.bag = randomBag(this.rand);
        this.piece = this.bag.shift();
        this.piece.reset();
        this.bag[0].setWaitingPos();
        this.getNextPath();
    }

    draw(sk: p5) {
        sk.clear();
        for(var y = 0; y < this.grid.length; y++) {
            for(var x = 0; x < this.grid[0].length; x++) {
                this.drawTile(sk, x, y, 50, TileColors[this.grid[y][x]]);
            }
        }
        this.piece.draw(sk);
        this.bag[0].draw(sk);
        this.goalPiece.draw(sk);
        this.drawPath(sk, 50);
    }

    /**
     * Perform the next step in the algorithm
     */
    step() {
        if(!this.gameOver) {
            this.performMoveStep();
        }
        return this.gameOver;
    }

    nextPiece() {
        this.setPiece();
        this.score += this.clearLines();

        // Next piece
        this.piece = this.bag.shift();
        this.piece.reset();
        if(this.piece.isColliding(this.grid)) {
            this.genome.setScore(this.score);
            this.gameOver = true;
        }
        
        // Get the set of possible positions
        this.getNextPath();

        if(this.bag.length < 2) {
            this.bag = this.bag.concat(randomBag(this.rand));
        }
        this.bag[0].setWaitingPos();
    }

    getNextPath() {
        let start = new Date().getTime();
        let {nodes, possible} = this.mapBoard();
        var path = null;
        var goal:Position = null;
        while(!path && possible.length) {
            goal = possible.shift();
            let algo = new Pathfinding(this.grid, this.piece, goal, nodes);
            path = algo.search();
            if(!path) {
                console.log('Invalid goal found');
            }
        }

        console.log(new Date().getTime() - start)
        
        this.path = path;
        this.goal = goal;
        this.goalPiece = this.piece.getOriginal();
        this.goalPiece.outline = true;
        this.goalPiece.setPos(goal.x, goal.y);
        this.goalPiece.rotate(goal.r);
    }

    performMoveStep() {
        let next = this.path && this.path[0];
        if(next) {
            if(next.y == this.piece.getY()) {
                let dx = next.x - this.piece.getX();
                let dr = next.r - this.piece.getR();
    
                if(dx) {
                    if(!this.piece.move(this.grid, dx)) {
                        throw 'Pathfinding failed'
                    }
                } else if(dr === 1) {
                    if(!this.piece.rotateLeft(this.grid)) {
                        throw 'Pathfinding failed'
                    }
                }

                this.path.shift();
            } else {
                this.piece.drop(this.grid)
            }
        } else {
            this.nextPiece();
        }
    }

    /**
     * Map the board to data that can be used to create 
     * a graph, and return the possible end positions.
     * 
     * Note: the y,x and r indices do not reflect the position of the piece
     * as piece positions can be negative.
     */
    mapBoard(): {
            nodes:{[key:string]:Position},
            possible:Position[],
        } {
        let nodes:{[key:string]:Position} = {};
        let positions: Position[] = [];
        for(var y = -1; y < this.grid.length - 2; y++) {
            for(var x = -2; x < this.grid[0].length - 2; x++) {
                for(var r = 0; r < 4; r++) {

                    // Setup the piece
                    let piece = this.piece.getOriginal();
                    piece.outline = true; // Graphically represent the outline
                    piece.reset();
                    piece.setPos(x, y);
                    piece.rotate(r);
                    
                    // See if this position is valid, and sitting on the ground
                    if(!piece.isColliding(this.grid)) {
                        let position = new Position(x, y, r);
                        nodes[position.toKey()] = position;
                        if(!piece.drop(this.grid)) {

                            let testGrid = Board.testPiece(clone2D(this.grid), piece);
                            var totalScore = 0;
                            var total = 0;

                            for(var y2 = -1; y2 < this.grid.length - 2; y2++) {
                                for(var x2 = -2; x2 < this.grid[0].length - 2; x2++) {
                                    for(var r2 = 0; r2 < 4; r2++) {
                                        let nextPiece = this.bag[0].getOriginal();
                                        nextPiece.reset();
                                        nextPiece.setPos(x2, y2);
                                        nextPiece.rotate(r2);
                                        if(!nextPiece.isColliding(testGrid)) {
                                            let testGrid2 = Board.testPiece(clone2D(testGrid), nextPiece);
                                            totalScore += this.getScore(testGrid2);
                                            total ++;
                                        }
                                    }
                                }
                            }

                            position.score = this.getScore(testGrid) + totalScore / total;
                            positions.push(position);

                        }
                    }

                }
            }
        }
        return {
            possible: positions.sort((p1, p2) => p2.score - p1.score),
            nodes: nodes,
        };
    }

    /**
     * Add the current piece to the board
     */
    private setPiece() {
        let shape = this.piece.getShape();
        for(var y = 0; y < shape.length; y++) {
            for(var x = 0; x < shape[0].length; x++) {
                if(shape[y][x]) {
                    this.grid[this.piece.getY() + y][this.piece.getX() + x] = shape[y][x];
                }
            }
        }
    }

    /**
     * Add the current piece to the board
     */
    private static testPiece(grid: number[][], piece:Piece): number[][] {
        let shape = piece.getShape();
        for(var y = 0; y < shape.length; y++) {
            for(var x = 0; x < shape[0].length; x++) {
                if(shape[y][x]) {
                    grid[piece.getY() + y][piece.getX() + x] = shape[y][x];
                }
            }
        }
        return grid;
    }

    /**
     * Clear the full lines from the board
     */
    private clearLines(): number {
        var linesToClear: number[] = [];
        for(var y = Board.Height - 1; y >= 0; y--) {
            var flag = true;
            for(var x = 0; x < Board.Width; x++) {
                if(!this.grid[y][x]) { flag = false; break; }
            }
            if(flag) linesToClear.push(y);
        }
        
        // Clear out the lines
        linesToClear.forEach(pos => {
            this.grid.splice(pos, 1);
        })

        // Add the empty lines back to the top
        for(var i = 0; i < linesToClear.length; i++) {
            this.grid.unshift(new Array(Board.Width).fill(0));
        }

        return linesToClear.length;
    }

    private drawTile(sk:p5, x: number, y: number, dim: number, hex:string) {
        sk.stroke(255);
        sk.strokeWeight(1);
        sk.fill(sk.color(hex));
        sk.rect(x * dim, y * dim, dim, dim);
    }

    private static generateBoard():number[][] {
        let grid:number[][] = [];
        for(var y = 0; y < Board.Height; y++) {
            grid.push(new Array(Board.Width).fill(0));
        }
        return grid;
    }

    private drawPath(sk: p5, dim:number) {
        if(this.path) {
            this.path.forEach(p => {
                sk.circle(p.x * dim + 10, p.y * dim + 10, 10);
            })
        }
    }

    private getScore(grid: number[][]) {
        return (
            this.getHeightScore(grid) * this.genome.heightWeight
            + this.getBumpinessScore(grid) * this.genome.bumpWeight
            + this.getHoleScore(grid) * this.genome.holeWeight
            + this.getClearLinesScore(grid) * this.genome.lineWeight
        )
    }

    /**
     * A score based on how tall the tower is
     * @param grid 
     */
    private getHeightScore(grid: number[][]) {
        var sum = 0;
        for(var x = 0; x < Board.Width; x++) {
            for(var y = 0; y < Board.Height; y++) {
                if(grid[x][y]) {
                    sum += Board.Height - y;
                    break;
                }
            }
        }
        return sum;
    }

    /**
     * A score based on how tall the tower is
     * @param grid 
     */
    private getHoleScore(grid: number[][]) {
        
        let tops:number[] = new Array(Board.Width).fill(Board.Height);
        var count = 0;

        // Start by finding the top index of each column
        for(var x = 0; x < Board.Height; x++) {
            for(var y = 0; y < Board.Height; y++) {
                if(grid[y][x]) {
                    tops[x] = y;
                    break;
                }
            }
        }

        // From the tops of each column, find holes beneath it
        for(var x = 0; x < Board.Width; x++) {
            for(var y = tops[x]; y < Board.Height; y++) {
                if(!grid[y][x]) count++;
            }
        }

        return count;
    }

    /**
     * Get how bumpy the board is
     */
    private getBumpinessScore(grid:number[][]) {

        let tops:number[] = new Array(Board.Width).fill(Board.Height);
        var sum = 0;

        // Start by finding the top index of each column
        for(var x = 0; x < Board.Height; x++) {
            for(var y = 0; y < Board.Height; y++) {
                if(grid[y][x]) {
                    tops[x] = y;
                    break;
                }
            }
        }

        // Sum the height diff between adjacent columns
        for(var x = 0; x < Board.Width - 1; x++) {
            sum = Math.abs(tops[x] - tops[x + 1]);
        }
        return sum;
    }

    /**
     * Get a score for how many lines are cleared
     * @param grid 
     */
    private getClearLinesScore(grid:number[][]) {
        var linesToClear = 0;
        for(var y = Board.Height - 1; y >= 0; y--) {
            var flag = true;
            for(var x = 0; x < Board.Width; x++) {
                if(!grid[y][x]) { flag = false; break; }
            }
            if(flag) linesToClear++;
        }
        return linesToClear;
    }

}