import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
`;

// Reference View Component
const ReferenceView = () => {
  const { id } = useParams(); // Get the reference ID from the URL
  const navigate = useNavigate();
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferenceDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/references/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReference(response.data); // Set the fetched reference data
      } catch (error) {
        console.error("Error fetching reference details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceDetails(); // Fetch reference details on component mount
  }, [id]);

  if (loading) {
    return <div>Loading...</div>; // Display loading state
  }

  if (!reference) {
    return <div>Reference not found</div>; // Handle case where reference is not found
  }

  console.log("REFERENCE: ", reference.reference);

  return (
    <Container>
      <h1>{console.log(reference)}</h1>
      <h1>Reference Details</h1>
      <h2>Product Name: {reference.code}</h2> {/* Display the product name */}
      <Button onClick={() => navigate(-1)}>Back</Button>{" "}
      {/* Button to go back */}
    </Container>
  );
};

export default ReferenceView;
