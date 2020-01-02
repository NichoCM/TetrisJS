/**
 * Clones a 2D array
 * @param array 
 */
export function clone2D(array:number[][]) {
    return array.map((row:number[]) => {
        return row.slice();
    });
}