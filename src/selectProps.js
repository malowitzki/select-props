const noChange = x => x;

const { isArray } = Array;

const selectProps = (...args) => {
  const parsers = {};
  let fromCaseTransform = noChange;
  let toCaseTransform = noChange;

  // If first argument is an array, use that as props and ignore the rest
  const props = isArray(args[0]) ? args[0] : args;

  props.forEach((prop) => {
    let key = prop;
    let parser = noChange;

    if (prop === Object(prop) && !isArray(prop)) {
      if (prop.key) {
        // if prop has a 'key' property, then look for an explicitly named parser as well
        ({ key, parser } = prop);
      } else {
        // else, assume the prop object has one key (the prop name) and the value is the parser
        [key] = Object.keys(prop);
        parser = prop[key];
      }

      if (typeof parser !== 'function') {
        throw new Error(`The parser supplied for key '${key}' must be a function!`);
      }
    }

    parsers[key] = parser;
  });

  const selector = (from) => {
    if (!from) {
      return from;
    }

    const to = {};
    Object.keys(parsers).forEach((key) => {
      const fromKey = fromCaseTransform(key);
      const toKey = toCaseTransform(key);
      to[toKey] = parsers[key](from[fromKey], from);
    });

    return to;
  };

  selector.withCaseTransform = ({ from, to }) => {
    if (from) {
      if (typeof from !== 'function') {
        throw new Error('The "from" transform supplied to withCaseTransform must be a function!');
      }
      fromCaseTransform = from;
    }

    if (to) {
      if (typeof to !== 'function') {
        throw new Error('The "to" transform supplied to withCaseTransform must be a function!');
      }
      toCaseTransform = to;
    }

    return selector;
  };

  // Sugary alias
  selector.from = selector;

  return selector;
};

module.exports = selectProps;
