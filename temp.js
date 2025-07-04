(async function () {
  const area = "manhattan";
  const city = "new york";
  const district = "america";
  const properLocation = await fetch(
    `https://nominatim.openstreetmap.org/search?q={${area} ${city} ${district}}&accept-language=en&format=json&limit=1&addressdetails=1`
  ).then((data) => data.json());

  const normalizedArea = properLocation[0].display_name.split(",")[0];
  const normalizedCity = properLocation[0].address.city_district;
  const normalizedDistrict = properLocation[0].address.county;
  console.log(isInNepal);

  const isInNepal = properLocation[0].address.country;

  if (!isInNepal) {
    throw Error("Provide Area Inside Nepal", { cause: "Wrong Area Location" });
  }

  console.log(normalizedArea, normalizedCity, normalizedDistrict);
})();
