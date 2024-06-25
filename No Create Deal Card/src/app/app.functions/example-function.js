// For HubSpot API calls
const hubspot = require('@hubspot/api-client');

// Entry function of this module, it fetches associated deals and calculates the statistics
exports.main = async (context = {}) => {
  const { hs_object_id } = context.propertiesToSend;

  console.log("Getting deals")
  const deals = await getAssociatedDeals(hs_object_id);
  console.log("Got deals")
  console.log(deals);

  return { deals: deals };
};

// Function to fetch associated deals with their properties
async function getAssociatedDeals(hs_object_id) {
  const hubSpotClient = new hubspot.Client({
    accessToken: process.env['PRIVATE_APP_ACCESS_TOKEN'],
  });

  // Fetch assisocisated deals ids
  const objectData = await hubSpotClient.crm.contacts.basicApi.getById(
    hs_object_id,
    null,
    null,
    ['deals']
  );
  if (!objectData.associations) {
    // No associated deals
    return ["No Deals"];
  }

  const dealIds = objectData.associations.deals.results.map((deal) => deal.id);
  // Fetch more deals prooperties to calculate needed numbers
  const deals = await hubSpotClient.crm.deals.batchApi.read({
    inputs: dealIds.map((id) => ({ id })),
  });

  const objectType = "deals";

  const dealStages = await hubSpotClient.crm.pipelines.pipelinesApi.getAll(objectType);
  console.log(JSON.stringify(dealStages, null, 2));
  console.log("Stages")
  console.log(dealStages);
  

  console.log("Returning Deal Results")
  console.log(deals.results);

  for (const deal of deals.results) {
    const stage = dealStages.results[0].stages.find(stage => stage.id === deal.properties.dealstage);
    if (stage) {
      deal.properties.dealstage = stage.label;
    }
  }

  return deals.results;
}