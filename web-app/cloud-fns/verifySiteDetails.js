Moralis.Cloud.define(
  "verifySiteDetails",
  async (request) => {
    const { siteId, apiKey } = request.params;

    // Check for existence of site
    try {
      const siteQuery = new Moralis.Query("Site").equalTo("siteId", siteId);
      const results = await siteQuery.find();
      if (results.length > 0) {
        return JSON.stringify({
          success: false,
          data: {
            message: "Site with this site ID already exists",
          },
        });
      }

      const siteDetailsResponse = await Moralis.Cloud.httpRequest({
        url: `https://monitoringapi.solaredge.com/site/${siteId}/details?api_key=${apiKey}`,
      }).then(function (httpResponse) {
        return httpResponse.text;
      });

      const Site = Moralis.Object.extend("Site");
      const site = new Site();

      site.set("siteId", siteId);
      site.set("apiKey", apiKey);
      site.set("name", JSON.parse(siteDetailsResponse).details.name);

      const saveResult = await site.save(null, { useMasterKey: true });

      return JSON.stringify({
        success: true,
        data: saveResult,
      });
    } catch (err) {
      return JSON.stringify({
        success: false,
        data: err,
      });
    }
  },
  {
    fields: ["siteId", "apiKey"],
  }
);