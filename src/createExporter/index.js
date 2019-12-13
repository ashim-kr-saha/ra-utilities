import { downloadCSV } from 'react-admin';
import { unparse as convertToCSV } from 'papaparse/papaparse.min';
import inflection from 'inflection';

async function getRelatedResource(records, relations, myFetch) {
  try {
    var data = await Promise.all(
      relations.map(({ fromField, resource }) =>
        myFetch(records, fromField, resource)
      )
    );

    return data;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

function makeHumanReadableKeys(records, fields) {
  var fieldMap = {};
  var newFields = [];
  var i = 0;
  for (i = 0; i < fields.length; i++) {
    var field = fields[i];
    if(field.startsWith("_an__")) {
      field = field.substr(5);
    }
    var humanize = inflection.humanize(field);
    fieldMap[fields[i]] = humanize;
    newFields.push(humanize);
  }
  var data = [];
  for (i = 0; i < records.length; i++) {
    var record = records[i];
    var n = {};
    for (var j = 0; j < fields.length; j++) {
      var field = fields[j];
      n[fieldMap[field]] = record[field];
    }
    data.push(n);
  }

  return { data: data, fields: newFields };
}

function convertFieldValue(records, converts) {
  if (converts && converts.length > 0 && records && records.length) {
    return records.map(r => {
      for (var i = 0; i < converts.length; i++) {
        var convert = converts[i];
        var field = convert.field;
        r[field] = convert.converter(r[field]);
      }
      return r;
    });
  } else {
    return records;
  }
}

export default (fields, options, name) => {
  var { relations, converts } = options;
  return (records, fetchRelatedRecords) => {
    if (relations && relations.length > 0) {
      var promise = getRelatedResource(records, relations, fetchRelatedRecords);
      promise.then(data => {
        var modifiedRecords = records.map(record => {
          for (var i = 0; i < relations.length; i++) {
            var relation = relations[i];
            var id = record[relation.fromField];
            var relativeData = data[i] !== undefined ? data[i][id] : undefined;
            for (var j = 0; j < relation.toFields.length; j++) {
              var toField = relation.toFields[j];
              record[toField.to] =
                relativeData !== undefined ? relativeData[toField.from] : '-';
            }
          }
          return record;
        });
        var convertedRecords = convertFieldValue(modifiedRecords, converts);
        const csv = convertToCSV(
          makeHumanReadableKeys(convertedRecords, fields)
        );
        downloadCSV(csv, name);
      });
    } else {
      var convertedRecords = convertFieldValue(records, converts);
      const csv = convertToCSV(makeHumanReadableKeys(convertedRecords, fields));
      downloadCSV(csv, name);
    }
  };
};
