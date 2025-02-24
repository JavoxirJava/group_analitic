fetch("http://167.172.68.187:5001/api/subscriptions/status", {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: 1, status: "true" }),
}).then((res) => res.json())
    .then(console.log)
    .catch(console.error);