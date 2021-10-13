import React from "react";
import { useCallback } from "react";
import { fetchData } from "../api/fetchData";

const getRows = (rows, inputKey) => {
  return Object.values(rows).filter((row) =>
    JSON.stringify("" + row)
      .toLowerCase()
      .includes(inputKey.toLowerCase())
  );
};

const extractHeaders = (object) => {
  let objectHeaders = [];
  const objectKeys = Object.keys(object);
  objectKeys.forEach((objectKey) => {
    const value = object[objectKey];
    if (typeof value !== "object") {
      objectHeaders.push(objectKey);
    } else {
      objectHeaders = [...objectHeaders, ...extractHeaders(value)];
    }
  });
  return objectHeaders;
};

const extractData = (location) => {
  let data = [];
  const locationKeys = Object.keys(location);
  locationKeys.forEach((key) => {
    const value = location[key];
    if (typeof value !== "object") {
      data.push(value);
    } else {
      data = [...data, ...extractData(value)];
    }
  });
  return data;
};

export const Tables = () => {
  const [people, setPeople] = React.useState(undefined);
  const [flattenedLocations, setFlattenedLocations] = React.useState([]);
  const [headers, setHeaders] = React.useState([]);
  const [isEditing, setIsEditing] = React.useState(undefined);
  const [sortingDirection, setSortingDirection] = React.useState(1); // 1 for ascendent - 1 for descendent
  const [inputField, setInputField] = React.useState("");

  const flattendHeaders = useCallback((location) => {
    setHeaders(extractHeaders(location));
  }, []);

  const getflattenedLocations = useCallback((result) => {
    const flattenedLocationsData = result.map(({ location }) =>
      flattendLocation(location)
    );
    setFlattenedLocations(flattenedLocationsData);
  }, []);

  const flattendLocation = (locations) => extractData(locations);

  const sortByHeader = (header) => {
    const indexHeader = headers.indexOf(header);
    const newFlattenedLocations = [...flattenedLocations];
    newFlattenedLocations.sort((a, b) => {
      const relevantValueA = a[indexHeader];
      const relevantValueB = b[indexHeader];

      if (relevantValueA < relevantValueB) return -1 * sortingDirection;
      if (relevantValueA > relevantValueB) return 1 * sortingDirection;
      return 0;
    });
    setFlattenedLocations(newFlattenedLocations);
    setSortingDirection(sortingDirection * -1);
  };

  React.useEffect(() => {
    fetchData().then((result) => {
      setPeople(result);
    });
  }, []);

  React.useEffect(() => {
    if (people) {
      flattendHeaders(people[0].location);
      getflattenedLocations(people);
    }
  }, [people, flattendHeaders, getflattenedLocations]);

  if (!people) {
    return <div style={{ fontSize: "5rem" }}>no data yet</div>;
  }

  return (
    <>
      <header>Click on the table's header to sort the list</header>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <label>Search by:</label>
        <input onChange={(e) => setInputField(e.target.value)} />
      </div>
      <table style={{ padding: "50px", width: "100%" }}>
        <thead>
          <tr style={{ cursor: "pointer" }}>
            {headers.length > 0 &&
              headers.map((t, index) => (
                <th
                  key={index}
                  style={{ paddingRight: 5 }}
                  onClick={() => sortByHeader(t)}
                >
                  {t}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {getRows(flattenedLocations, inputField).map((location, index) => (
            <tr key={index}>
              {headers.map((_, headerIdx) => {
                return (
                  <Cell
                    key={headerIdx}
                    id={headerIdx}
                    value={location[headerIdx]}
                    isEditing={isEditing}
                    onChange={(id) => setIsEditing(id)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const Cell = ({ id, value, isEditing, onChange }) => {
  if (isEditing === undefined || isEditing !== id) {
    return (
      <td
        id={id}
        style={{ color: "black", fontSize: "1rem" }}
        onClick={(e) => onChange(e.target.id)}
      >
        {value}
      </td>
    );
  }

  if (isEditing === id) {
    return <input placeholder="enter here" />;
  }
};
