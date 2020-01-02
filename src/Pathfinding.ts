import Piece from "./Pieces";

type Edge = {
    a: Position,
    b: Position,
}

export class Position {
    x: number;
    y: number;
    r: number;
    piece?: Piece;
    score?: number;

    constructor(x:number, y:number, r:number, piece:Piece = null, score:number = null) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.piece = piece;
        this.score = score;
    }

    toKey() {
        return `${this.x}_${this.y}_${this.r}`
    }
}

export default class Pathfinding {

    initialPiece: Piece;
    grid:number[][];
    goal:Position;

    nodes: {[key:string]:Position} = {}; // y,x,r positions
    edges: {[key:string]:Position[]} = {};
    openSet:{[key:string]:Position} = {};
    cameFrom:{[key:string]:Position} = {};
    gScore:{[key:string]:number} = {}
    fScore:{[key:string]:number} = {};

    constructor(grid:number[][], piece:Piece, goal:Position, nodes:{[key:string]:Position}) {

        this.grid = grid;
        this.nodes = nodes;
        this.initialPiece = piece;
        this.goal = goal;

        // Initial position
        let start = new Position(piece.getX(), piece.getY(), 0);

        this.openSet[start.toKey()] = start;

        this.connectNodes();
        this.setGScore(start, 0);
        this.setFScore(start, this.heuristic(start));
    }

    search(): Position[] {

        while(Object.values(this.openSet).length) {
            let current = this.getLowestFscoreInSet();
            if(current.toKey() == this.goal.toKey()) {
                return this.buildPath(current);
            }
            
            // Remove the current
            delete this.openSet[current.toKey()];

            // Get neighbors
            let neighbors = this.edges[current.toKey()] || [];

            neighbors.forEach(node => {
                var minGScore = this.getGScore(current) + 1;
                if(minGScore < this.getGScore(node)) {
                    this.cameFrom[node.toKey()] = current;
                    this.setGScore(node, minGScore);
                    this.setFScore(node, this.heuristic(node));
                    if(!this.openSet[node.toKey()]) {
                        this.openSet[node.toKey()] = node;
                    }
                }
            });
        }
        return null;
    }

    /**
     * Connect nodes that can be to form
     * the graph
     */
    private connectNodes() {

        Object.values(this.nodes).forEach(position => {
            var {x, y, r} = position;
            let neighbors:Position[] = [];

            // Initial piece
            let piece = this.initialPiece.getOriginal();
            piece.rotate(r);

            // Right
            piece.setPos(x + 1, y);
            if(!piece.isColliding(this.grid)) {
                let p2 = new Position(x + 1, y, r);
                neighbors.push(p2);
            }

            // Left
            piece.setPos(x - 1, y);
            if(!piece.isColliding(this.grid)) {
                let p2 = new Position(x - 1, y, r);
                neighbors.push(p2);
            }

            // Down
            piece.setPos(x, y + 1);
            if(!piece.isColliding(this.grid)) {
                let p2 = new Position(x, y + 1, r);
                neighbors.push(p2);
            }

            // Rotate left
            piece.setPos(x, y);
            piece.rotate(1)
            if(!piece.isColliding(this.grid)) {
                let p2 = new Position(x, y, (r + 1) % 4);
                neighbors.push(p2);
            }
            this.edges[position.toKey()] = neighbors;
        })

    }

    /**
     * Set the gscore
     * @param x 
     * @param y 
     * @param r 
     * @param value 
     */
    private setGScore(position:Position, value:number) {
        this.gScore[position.toKey()] = value;
    }

    /**
     * Set the fscore
     * @param x 
     * @param y 
     * @param r 
     * @param value 
     */
    private setFScore(position:Position, value:number) {
        this.fScore[position.toKey()] = value;
    }

    /**
     * Get the gscore
     * @param x 
     * @param y 
     * @param r 
     * @param value 
     */
    private getGScore(position:Position) {
        let key = position.toKey();
        if(this.gScore[key] === undefined) return Infinity;
        return this.gScore[key];
    }

    /**
     * Get the fscore
     * @param x 
     * @param y 
     * @param r 
     * @param value 
     */
    private getFScore(position:Position) {
        let key = position.toKey();
        if(this.fScore[key] === undefined) return Infinity;
        return this.fScore[key];
    }

    /**
     * Our heuristic function
     * @param position 
     */
    private heuristic(position:Position) {
        return Math.abs(position.x - this.goal.x) + Math.abs(position.y - this.goal.y) * Math.abs(Math.sin(position.r * Math.PI / 2) - Math.sin(this.goal.r * Math.PI / 2));
    }

    private getLowestFscoreInSet(): Position {
        var minPosition:Position = null;
        var minFScore:number = Infinity;
        Object.values(this.openSet).forEach(position => {
            let fScore = this.getFScore(position);
            if(fScore < minFScore) {
                minPosition = position;
                minFScore = fScore;
            }
        })
        return minPosition;
    }

    private buildPath(current:Position): Position[] {
        let path = [current];
        while(this.cameFrom[current.toKey()]) {
            current = this.cameFrom[current.toKey()];
            path.unshift(current)
        }
        return path;
    }

}