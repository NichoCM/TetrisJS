export type Weights = {
    lineWeight: number;
    heightWeight: number;
    holeWeight: number;
    bumpWeight: number;
}

export class Genome implements Weights {

    private mutationRate = 0.05;
    private mutationRange = 0.1;

    public lineWeight: number = 0.760666;
    public heightWeight: number = -0.510066;
    public holeWeight: number = -0.35663;
    public bumpWeight: number = -0.184483;

    private score: number = -Infinity;

    constructor(weights:Weights = null) {
        if(!weights) {
            weights = randomWeights();
        }
        this.lineWeight = weights.lineWeight;
        this.heightWeight = weights.heightWeight;
        this.holeWeight = weights.holeWeight;
        this.bumpWeight = weights.bumpWeight;
    }

    mutate() {
        if (Math.random() < this.mutationRate) {
            this.lineWeight += Math.random() * this.mutationRange * 2 - this.mutationRange; 
        }
        if (Math.random() < this.mutationRate) {
            this.heightWeight += Math.random() * this.mutationRange * 2 - this.mutationRange; 
        }
        if (Math.random() < this.mutationRate) {
            this.holeWeight += Math.random() * this.mutationRange * 2 - this.mutationRange; 
        }
        if (Math.random() < this.mutationRate) {
            this.bumpWeight += Math.random() * this.mutationRange * 2 - this.mutationRange; 
        }
    }

    breed(genome:Genome) {
        let weights:Weights = {
            lineWeight: pick(this.lineWeight, genome.lineWeight),
            heightWeight: pick(this.heightWeight, genome.heightWeight),
            holeWeight: pick(this.holeWeight, genome.holeWeight),
            bumpWeight: pick(this.bumpWeight, genome.bumpWeight),
        }
        let child = new Genome(weights);
        child.mutate();
        return child;
    }

    setScore(score: number) {
        this.score = score;
    }

    getScore() {
        return this.score;
    }

}

export default class Population {

    private size: number;
    public currentIndex = 0;
    private genomes: Genome[] = [];

    public generation = 0;
    public lastPopulationScore = 0;

    constructor(size: number) {
        this.size = size;
    
        for(var i = 0; i < size; i++) {
            this.genomes.push(new Genome());
        }
    }

    next(): Genome {
        if(this.currentIndex < this.genomes.length) {
            return this.genomes[this.currentIndex++];
        } else {
            this.nextGeneration();
            return this.next();
        }
    }

    nextGeneration() {
        this.lastPopulationScore = this.getGenerationScore();
        this.genomes = this.genomes.sort((a, b) => b.getScore() - a.getScore());

        console.log(`Generation ${this.generation} score: ${this.lastPopulationScore}`);
        console.log('Best genome', this.genomes[0]);

        let genomes:Genome[] = [];
        while(genomes.length < this.size) {
            let p1 = this.genomes[Math.floor(weightedRandom() * this.genomes.length)];
            let p2 = this.genomes[Math.floor(weightedRandom() * this.genomes.length)];
            genomes.push(p1.breed(p2));
        }
        this.genomes = genomes;
        this.generation++;
        this.currentIndex = 0;
    }

    private getGenerationScore() {
        var sum = 0;
        this.genomes.forEach(genome => {
            sum += genome.getScore();
        });
        return sum;
    }

}

function randomWeights(): Weights {
    return {
        lineWeight: Math.random() * 2 - 1,
        heightWeight: Math.random() * 2 - 1,
        holeWeight: Math.random() * 2 - 1,
        bumpWeight: Math.random() * 2 - 1,
    }
}

function weightedRandom(): number {
    return Math.pow(Math.random(), 2);
}

function pick<T>(a:T, b:T) {
    return Math.random() < 0.5 ? a : b;
}