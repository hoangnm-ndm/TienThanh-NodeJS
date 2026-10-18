const myArr = ["sp A", "sp B"];

myArr.length = 0;
/**
 * * Độ dài của mảng là số lượng phần tử trong mảng -> Sai
 * * Độ dài của mảng = index của phần tử cuối + 1
 */

console.log(myArr);

const arrA = [1, 2, 3];

arrA.length = 10;

//* [1,2,3,,,,,,,,] mảng thưa
console.log(arrA);

const arrB = [1, 2, 3, , , , , 5, 6, 7];
console.log(arrB.length);
console.log(arrB[6]);
console.log(typeof arrB);
