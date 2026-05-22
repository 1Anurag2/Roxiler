import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/rating.css";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/stores");
      setStores(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRate = async (storeId, score) => {
    try {
      await axios.post("http://localhost:5000/api/users/rate", {
        storeId,
        score,
      });
      fetchStores(); // Refresh to get updated ratings
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container">
      <div className="header-row">
        <h1>Store Listings</h1>
        <input
          type="text"
          placeholder="Search by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            width: "300px",
          }}
        />
      </div>

      <div
        className="dashboard-stats"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}
      >
        {filteredStores.map((store) => (
          <div key={store.id} className="card">
            <h2 style={{ marginBottom: "0.5rem" }}>{store.name}</h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
              }}
            >
              {store.address}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Overall Rating
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "var(--primary)",
                  }}
                >
                  {store.overallRating
                    ? Number(store.overallRating).toFixed(1)
                    : "N/A"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Your Rating
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {store.userRating ? store.userRating : "-"}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                {store.userRating ? "Modify your rating:" : "Submit a rating:"}
              </div>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`rating-star ${
                      star <= (store.userRating || 0) ? "active" : ""
                    }`}
                    onClick={() => handleRate(store.id, star)}
                    title={`${star} Star`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredStores.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-secondary)",
            }}
          >
            No stores found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
