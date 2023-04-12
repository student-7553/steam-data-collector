export function objectToValues(object: object): string {
  const objectValues = Object.values(object);
  let stringValue = "";
  objectValues.map((value, index) => {
    let filteredValue = typeof value === "string" ? `'${value}'` : value;
    if (value === undefined) {
      filteredValue = "NULL";
    }

    if (index === 0) {
      stringValue = stringValue + filteredValue;
    } else {
      stringValue = stringValue + `,${filteredValue}`;
    }
  });

  const values = `(${stringValue})`;
  return values;
}
