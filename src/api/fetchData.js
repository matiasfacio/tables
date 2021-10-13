export const fetchData = async () => {
  try {
    const result = await fetch("https://randomuser.me/api/?results=20");
    if (!result.ok) {
      throw new Error("error fetching data");
    }
    const data = await result.json();
    return data.results;
  } catch (error) {
    console.error(error);
  }
};
