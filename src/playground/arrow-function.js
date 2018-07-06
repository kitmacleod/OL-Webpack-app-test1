// Arguments fed into one or more statements

// var square = (x) => {
//   var result = x * x;
//   return result;
// };

// console.log(square(9));

// Concise syntax without curly braces if just one arg then no ()
var square = x => x * x;
console.log(square(9));

// More complicated example

var  user = {
  name: 'Kit',
  sayHi: () => {
    console.log(`Hi`);
  }
};
user.sayHi();

// Arrow functions do not bind 'this

var  user = {
  name: 'Kit',
  sayHi: () => {
    console.log(`Hi. I'm ${this.name}`);
  },
  // Need to use regular function syntax for 'this' etc (methods on objects)
  sayHiAlt () { 
    console.log(arguments);
    console.log(`Hi. I'm ${this.name}`);
  }
};
user.sayHiAlt(1,2,3);


// Another quirk, does not binf arg array
