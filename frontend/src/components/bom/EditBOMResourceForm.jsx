import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px; /* Add space between buttons */
  margin-top: 10px;
`;

const Button = styled.button`
  background-color: #4267B2;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #3758a5;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

const EditBOMResourceForm = ({
  resourceToEdit,
  onResourceUpdated,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(resourceToEdit.quantity || 0);
  const [error, setError] = useState("");

  const API_BASE_URL = 'http://localhost:5005';

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/api/bom-resources/${resourceToEdit._id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Fetch updated data after the resource is edited
      onResourceUpdated();
    } catch (err) {
      console.log(err);
      setError("Error updating BOM resource.");
    }
  };

  return (
    <Form onSubmit={handleUpdateResource}>
      <Label>Quantity</Label>
      <Input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ButtonContainer>
        <Button type="submit">Save Changes</Button>
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
      </ButtonContainer>
    </Form>
  );
};

export default EditBOMResourceForm;
