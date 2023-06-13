const API = 'http://localhost:3333';

/**
 * A helper function to fetch data from your API.
 */
export async function fetchFromAPI(endpointURL, opts) {
  const { method, body } = { method: 'POST', body: null, ...opts };

  console.log("message to be sent:");
  console.log(method)
  console.log(body);
  console.log({
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const res = await fetch(`${API}/${endpointURL}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // debug
  var res_clone;
  res_clone = await res.clone();
  console.log(res_clone.text());
  //

  return res.json();
}