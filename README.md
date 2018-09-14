# select-props
A nifty little utility for composing payloader functions

## install
```
npm i -s select-props
```

## use
```
import selectProps from 'select-props';
```
Use `selectProps` to compose payloader functions. "But what's a payloader?!" I hear you cry. For the uninitiated (or those just those who don't use the same word), a payloader takes a handful of properties from one object and puts them into a new object, sometimes doing some parsing along the way. They can be useful for parsing data structures in API responses, for example.

`selectProps` lets you compose payloaders with a very DRY pattern. It's fairly extensible, allows you to integrate custom parsing, and supports basic case conversion of property names.
### basic selection
Call `selectProps` with a list of keys to compose a function that will select those keys and copy their values over to a new object—basically, to create a subset of the input data. The list of prop names can be supplied as a series of arguments, or as a single array argument:
```
const fruit = {
  apple: 'red',
  banana: 'yellow',
  orange: 'orange',
};

const applesAndBananas = selectProps('apple', 'banana').from(fruit);
// { apple: 'red', banana: 'yellow' }

const applesAndOranges = selectProps(['apple', 'orange']).from(fruit);
// { apple: 'red', orange: 'orange' }
```
The `from` method is pure syntactic sugar—`selectProps` returns a function that you can curry off of directly, or pass into a higher-order function:
```
const fruit = [
  {
    name: 'apple',
    color: 'red',
  },
  {
    name: 'banana',
    color: 'yellow',
  },
  {
    name: 'orange',
    color: 'orange',
  },
];

const nameSelector = selectProps('name');
const fruitNames = fruit.map(nameSelector);
// [{ name: 'apple' }, { name: 'banana' }, { name: 'orange' }]
```

### parsing
If you need to do more than a simple copy from input to output, `selectProps` can take in a parsing function to be applied to the prop value from the input. If you give the parser function the same name as the key that it parses, ES6 object shorthand makes this look devastatingly simple—just wrap your property name in curly braces instead of quotes!
```
const apple = color => `Apples are ${color}`;
const banana = color => `Bananas are ${color}`;

const fruit = {
  apple: 'red',
  banana: 'yellow',
  orange: 'orange',
};

const applesAndBananas = selectProps(
  { apple },
  { banana }
).from(fruit);
// { apple: 'Apples are red', banana: 'Bananas are yellow' }
```
Alternatively, you can pass in any other parser the same way:
```
const justBananas = selectProps(
  { banana: str => str.toUpperCase() }
).from(fruit);
// { banana: 'YELLOW' }
```
Or, explicitly name the key and parser:
```
const justOranges = selectProps(
  { key: 'orange', parser: color => `Oranges are ${color}, duh` }
).from(fruit);
// { orange: 'Oranges are orange, duh' }
```
If the incoming object has a nested structure, you can also nest `selectProps` like so:
```
const goldenDelicious = {
  color: 'yellow',
  comparisonRules: {
    doNotCompareTo: ['oranges'],
    doCompareTo: ['red delicious', 'fuji', 'granny smith'],
  },
};

const parsedGoldenDelicious = selectProps(
  'color',
  { comparisonRules: selectProps('doNotCompareTo') }
).from(goldenDelicious);
// { color: 'yellow', comparisonRules: { doNotCompareTo: ['oranges'] } }
```
### parsers
Parsers most often just need one argument—the prop value from the input object—but sometimes the parsing logic is more complex, and needs access to the whole input object (for example, to select a fallback value). If that's the case, just have your parser take the whole input object as a second argument, like so:
```
const apple1 = {
  description: 'shiny and red',
  color: 'red',
};

const apple2 = {
  color: 'green',
};

const description = (val, apple) => val || apple.color;

const appleParser = selectProps({ description });
const parsedApple1 = appleParser(apple1);
// { description: 'shiny and red' }
const parsedApple2 = appleParser(apple2);
// { description: 'green' }
```
### case conversion
`selectProps` supports basic case conversion of property names. Chain the `withCaseTransform` method off of your builder and supply a `from` and/or `to` transform to tell `selectProps` which keys to look for in your input object, and how to format the keys in your output object. Case transforms are functions that take a string and convert it to another case. You can use your own custom case transforms if you want to, but the [case](https://www.npmjs.com/package/case) library provides a reliable set of case transforms.
```
import Case from 'case';

const x = { MeaningOfLife: 42, HelloWorld: '!' };

const y = selectProps('meaningOfLife', 'helloWorld')
  .withCaseTransform({ from: Case.pascal })
  .from(x);
// { meaningOfLife: 42, helloWorld: '!' }

const z = selectProps('MeaningOfLife', 'HelloWorld')
  .withCaseTransform({ to: Case.snake })
  .from(x);
// { meaning_of_life: 42, hello_world: '!' }
```
## contribute
Be kind and ~~rewind~~ lint and test before submitting a pull request:
```
npm run lint && npm run test
```