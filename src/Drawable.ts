import p5 from 'p5';

export default interface Drawable {

    setup?(sk:p5): void;

    draw(sk:p5): void;

}