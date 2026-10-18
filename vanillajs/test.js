// * function contructor

// * ECMA 6+

function User(email, password, address) {
  this.email = email;
  this.password = password;
  this.address = address;
}

console.log(Array);
console.log(User);

User.prototype.hello = function (name = "ban") {
  console.log(`xin chao ${name}`);
};
// * instance = nguyên mẫu = 1 thực thể có giá trị thật được làm ra từ bản thiết kế (function contructor)
const hoangInfor = new User("hoang@gmail.com", "matkhau123", "BN");
hoangInfor.hello = function (name = "ban") {
  console.log(`bonjour ${name}`);
};
hoangInfor.hello("Obama");

console.log(hoangInfor);
