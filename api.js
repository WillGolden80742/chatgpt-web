async function api_search(query, numResults, timePeriod, region) {

    var url = `https://ddg-webapp-aagd.vercel.app/search?max_results=${numResults}&q=${query}`;
    if (timePeriod !== "") {
        url += `&time=${timePeriod}`;
    }

    const response = await fetch(url);
    return await response.json();
}