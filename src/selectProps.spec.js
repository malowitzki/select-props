const Case = require('case');

const selectProps = require('./selectProps.js');

const x = { foo: 0, bar: 1, baz: 2 };
const z = { MeaningOfLife: 42, HelloWorld: '!' };

test('selects only named props', () => {
  const props = ['foo', 'bar'];

  expect.assertions(3);

  const y = selectProps(...props).from(x);

  expect(y.foo).toEqual(x.foo);
  expect(y.bar).toEqual(x.bar);
  expect(y.baz).toBeUndefined();
});

test('curries properly', () => {
  const props = ['foo', 'bar'];

  expect.assertions(3);

  const y = selectProps(...props)(x);

  expect(y.foo).toEqual(x.foo);
  expect(y.bar).toEqual(x.bar);
  expect(y.baz).toBeUndefined();
});

test('treats first argument array as prop list', () => {
  const props = ['foo', 'bar'];

  expect.assertions(3);

  const y = selectProps(props).from(x);

  expect(y.foo).toEqual(x.foo);
  expect(y.bar).toEqual(x.bar);
  expect(y.baz).toBeUndefined();
});

test('applies custom parsers for each prop', () => {
  const foo = jest.fn(a => a + 1);
  const props = [{ foo }, 'bar'];

  expect.assertions(4);

  const y = selectProps(...props).from(x);

  expect(y.foo).toEqual(foo(x.foo));
  expect(foo).toHaveBeenCalledWith(x.foo, x);
  expect(y.bar).toEqual(x.bar);
  expect(y.baz).toBeUndefined();
});

test('transforms prop names from PascalCase', () => {
  const props = ['meaningOfLife', 'helloWorld'];

  expect.assertions(2);

  const y = selectProps(...props)
    .withCaseTransform({ from: Case.pascal })
    .from(z);

  expect(y.meaningOfLife).toEqual(z.MeaningOfLife);
  expect(y.helloWorld).toEqual(z.HelloWorld);
});

test('transforms prop names to camelCase', () => {
  const props = ['MeaningOfLife', 'HelloWorld'];

  expect.assertions(2);

  const y = selectProps(...props)
    .withCaseTransform({ to: Case.camel })
    .from(z);

  expect(y.meaningOfLife).toEqual(z.MeaningOfLife);
  expect(y.helloWorld).toEqual(z.HelloWorld);
});
